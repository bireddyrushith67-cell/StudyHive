import { Card } from './Card.jsx'
import { ActionButton } from './ActionButton.jsx'

export function PageScaffold({ title, subtitle, cards = [] }) {
  return (
    <section>
      <div className="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="grid two-col">
        {cards.map((card) => (
          <Card key={card.title} title={card.title}>
            <p>{card.description}</p>
            {card.actions?.length ? (
              <div className="button-row">
                {card.actions.map((action) => (
                  <ActionButton
                    key={action}
                    label={action}
                    onClick={() => console.log(`${action} clicked`)}
                  />
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  )
}
