import { Parser, Writer, Store } from 'n3'
import Link from './Link'
import Prefer from './Prefer'
import { LDP, Trellis, RDF, PROV, AS } from './Vocab'

class Client {

  constructor(url) {
    this.url = url;
  }

  async fetchHead(url) {
    const res = await fetch(url || this.url, {method: 'HEAD', cache: 'no-store'});
    const data = {
      types: Link.parse(res.headers.get("Link")).filter(l => l.rel === "type").map(l => l.uri),
      mementos: Link.parse(res.headers.get("Link")).filter(l => l.rel === "memento"),
      description: Link.parse(res.headers.get("Link")).filter(l => l.rel === "describedby").map(l => l.uri)[0],
      contentType: res.headers.get("Content-Type")
    }
    if (!res.ok) {
      data.err = res.statusText
    }
    return data;
  }

  async updateResource(url, content, contentType = 'application/sparql-update') {
    return await fetch(url || this.url, {
      method: "PATCH",
      headers: { "content-type": contentType },
      body: content
    });
  }

  async replaceResource(url, content, contentType = 'text/turtle') {
    return await fetch(url || this.url, {
      method: "PUT",
      headers: { "content-type": contentType },
      body: content
    });
  }

  async createResource(url, content, ldpType, slug, contentType = 'text/turtle') {
    const headers = {
      "content-type": contentType
    }
    if (ldpType) {
      headers.link = "<" + ldpType + ">; rel=\"type\"";
    }
    if (slug && slug.length > 0) {
      headers.slug = slug;
    }
    return await fetch(url || this.url, {
      method: "POST",
      headers: headers,
      body: content
    });
  }

  async deleteResource(url) {
    return await fetch(url || this.url, { method: "DELETE" });
  }

  async fetchQuads(url, headers) {
    const rdf = await fetch(url || this.url, { headers: headers }).then(res => res.text()).catch(err => '');
    if (headers.accept === "text/turtle") {
      return rdf.length > 0 ? new Parser().parse(rdf) : [];
    }
    return rdf;
  }

  async fetchContent(url) {
    return await fetch(url || this.url).then(res => res.text()).catch(err => '');
  }

  async serializeQuads(quads = []) {
    const writer = new Writer();
    quads.forEach(q => writer.addQuad(q));
    return new Promise((resolve, reject) =>
      writer.end((err, data) => err ? reject(err) : resolve(data)));
  }

  async fetchAudit(url) {
    const store = new Store();
    store.addQuads(await this.fetchQuads(url, {
        accept: "text/turtle",
        prefer: Prefer.representation(Trellis.PreferAudit,
          [LDP.PreferMinimalContainer, LDP.PreferMembership, LDP.PreferContainment])
      }));

    return store.getSubjects(RDF.type, PROV.Activity).map(s => ({
        agent: store.getObjects(s, PROV.wasAssociatedWith).map(o => o.value)[0],
        event: store.getObjects(s, RDF.type).map(o => o.value).find(o => o.startsWith(AS.getNs())),
        date: (
          store.getObjects(s, PROV.atTime)[0] || store.getObjects(s, PROV.startedAtTime)[0] || {}
        ).value
      }))
  }

  async fetchResource(url, contentType) {
    if (contentType === "application/ld+json") {
      return await this.fetchQuads(url, {
        accept: contentType,
        prefer: Prefer.representation(LDP.PreferMinimalContainer)
      })
    } else {
      return this.serializeQuads(await this.fetchQuads(url, {
        accept: "text/turtle", prefer: Prefer.representation(LDP.PreferMinimalContainer)
      }));
    }
  }

  async fetchMembership(url) {
    return this.fetchQuads(url, {
      accept: "text/turtle",
      prefer: Prefer.representation(Trellis.PreferMembership, [LDP.PreferMinimalContainer, LDP.PreferContainment])
    });
  }

  async fetchContainment(url) {
    return this.fetchQuads(url, {
      accept: "text/turtle",
      prefer: Prefer.representation(Trellis.PreferContainment, [LDP.PreferMinimalContainer, LDP.PreferMembership])
    }).then(quads => quads.map(q => q.object.value));
  }

  static parseContentType(contentType = '') {
    const mediaType = contentType.split(';')[0];
    const [type = '', subType = ''] = mediaType.split('/', 2);
    return {
      type: type.trim(),
      subType: subType.trim()
    };
  }
}

export default Client
