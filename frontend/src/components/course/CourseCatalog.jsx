import { Link } from "react-router-dom";

export function CourseCatalog({ heading, cards }) {
  return (
    <section className="catalog">
      <div className="catalog__banner">
        <h1>{heading}</h1>
      </div>
      <div className="catalog__grid">
        {cards.map((card, index) => {
          const startClass = cards.length > 1 && index === 1 ? "btn btn--primary catalog-card__start" : "btn btn--ghost catalog-card__start";
          const start = card.to ? (
            <Link className={startClass} to={card.to}>Start learning</Link>
          ) : (
            <button className={startClass} type="button" onClick={card.onStart} disabled={!card.onStart}>Start learning</button>
          );
          return (
            <article className="catalog-card" key={card.id}>
              <div className={`catalog-card__cover tone-${index % 3}`}>
                <img src="/assets/images/abdullahi.jpg" alt="Abdullahi Abukar Ahmed, the mentor known as Tripple A" />
              </div>
              <h2>{card.title}</h2>
              <p className="catalog-card__by"><img src="/assets/images/abdullahi.jpg" alt="" /> By Tripple A</p>
              {start}
              {card.extra || null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
