import React from 'react'

export const Alerts = ({alert}) => (
  <section>
    { alert && <p>{alert}</p> }
  </section>
)
