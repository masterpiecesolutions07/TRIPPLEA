import { useEffect, useState } from "react";
import api from "../api/axiosInstance.js";
import { FALLBACK_FAQS } from "../data/faqs.js";
import { Accordion } from "./Accordion.jsx";

export function FaqList() {
  const [items, setItems] = useState(FALLBACK_FAQS);

  useEffect(() => {
    api.get("/public/faqs")
      .then((response) => {
        if (Array.isArray(response.data.items)) setItems(response.data.items);
      })
      .catch(() => {});
  }, []);

  if (!items.length) return <p className="note">No questions yet.</p>;
  return <Accordion items={items.map((item) => ({ id: item.id, title: item.question, body: item.answer }))} />;
}
