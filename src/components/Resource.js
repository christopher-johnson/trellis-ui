import React from 'react';

export const Resource = ({data = '', types = [], onClick}) => (
    <section id="ldpResource">
      <pre>{data}</pre>
    </section>
)
