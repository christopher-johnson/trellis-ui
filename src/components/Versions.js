import React from 'react'
import Config from '../Config'

export const Versions = ({versions = [], identifier = '', onClick}) => (
  <section className="ldpList">
    { versions.length > 0 && <h2>Versions</h2> }
    <ul>
      {versions.map((version, idx) => (
        <li key={idx} onClick={() => onClick(null, version.uri.replace(Config.BASE_URL, ""))}>
          {new Date(version.params['datetime']).toLocaleString()}
        </li>
      ))}
      { (identifier.split("?")[1] || "").includes("version=") &&
          <li key="-1" onClick={() => onClick(null, identifier.split("?")[0])}>Current Version</li> }
    </ul>
  </section>
)
