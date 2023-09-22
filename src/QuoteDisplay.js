import React, { useState, useEffect } from "react";
import { BehaviorSubject, interval } from "rxjs";
import { switchMap } from "rxjs/operators";
import axios from "axios";

const QuoteDisplay = () => {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuote = () => {
    const url = "https://type.fit/api/quotes";

    // Используем BehaviorSubject для управления данными
    const quoteSubject = new BehaviorSubject("");

    // Выполняем запрос к бесплатному API цитат
    axios
      .get(url)
      .then((response) => response.data)
      .then((data) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomQuote = data[randomIndex].text;
        quoteSubject.next(randomQuote);
        setQuote(randomQuote);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching quote:", error);
        setLoading(false);
        setError("Failed to fetch quote");
      });

    return quoteSubject.asObservable();
  };

  useEffect(() => {
    fetchQuote();

    // Обновляем цитату каждые 10 секунд
    const timer$ = interval(10000);

    const subscription = timer$
      .pipe(
        switchMap(() => fetchQuote()) // Получаем новую цитату каждые 10 секунд
      )
      .subscribe();

    return () => {
      // Отписываемся от потока при размонтировании компонента
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h1>Random Quote</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && <p>{quote}</p>}
    </div>
  );
};

export default QuoteDisplay;
