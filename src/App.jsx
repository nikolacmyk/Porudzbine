import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl-LfY23r99w3wXV2dHsUJ3ldgVTZHTZM",
  authDomain: "porudzbine-fa150.firebaseapp.com",
  projectId: "porudzbine-fa150",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [form, setForm] = useState({
    narucilac: "",
    proizvod: "",
    datum: "",
    placanje: "",
    boje: Array(6).fill({ boja: "", kolicina: "" }),
    tekstil: Array(6).fill({ velicina: "", kolicina: "", boja: "" }),
  });

  useEffect(() => {
    loadOrders();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTableChange = (type, index, field, value) => {
    const updated = [...form[type]];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, [type]: updated });
  };

  const loadOrders = async () => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders(data);
  };

  const addOrder = async () => {
    await addDoc(collection(db, "orders"), { ...form, zavrseno: false });

    emailjs.send(
      "service_h8z6mgs",
      "template_p2xs8ip",
      { narucilac: form.narucilac, proizvod: form.proizvod },
      "O518nhvMYKnyISqzw"
    );

    setForm({
      narucilac: "",
      proizvod: "",
      datum: "",
      placanje: "",
      boje: Array(6).fill({ boja: "", kolicina: "" }),
      tekstil: Array(6).fill({ velicina: "", kolicina: "", boja: "" }),
    });

    loadOrders();
  };

  const toggleDone = async (order) => {
    await updateDoc(doc(db, "orders", order.id), { zavrseno: !order.zavrseno });
    loadOrders();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: 10, fontFamily: "Arial" }}>
      <h1 style={{ color: "#d90429" }}>Porudžbine</h1>

      {/* Dodavanje nove porudžbine */}
      <div style={{ marginBottom: 20 }}>
        <input placeholder="Naručilac" name="narucilac" value={form.narucilac} onChange={handleChange} />
        <input placeholder="Proizvod" name="proizvod" value={form.proizvod} onChange={handleChange} />
        <input type="date" name="datum" value={form.datum} onChange={handleChange} />
        <select name="placanje" value={form.placanje} onChange={handleChange}>
          <option value="">Plaćanje</option>
          <option value="kes">Keš</option>
          <option value="ziralno">Žiralno</option>
        </select>
        <button onClick={addOrder} style={{ background: "#d90429", color: "white" }}>Dodaj</button>
      </div>

      {/* Lista porudžbina */}
      <table width="100%" border="1">
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ background: o.zavrseno ? "#d4edda" : "#fff" }}>
              <td>
                <input type="checkbox" checked={o.zavrseno || false} onChange={() => toggleDone(o)} />
              </td>
              <td>{o.narucilac}</td>
              <td>{o.proizvod}</td>
              <td>
                <button onClick={() => setSelectedOrder(o)}>Prikaži</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal detalja */}
      {selectedOrder && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "white", padding: 20, width: "90%", maxWidth: 400 }}>
            <h3>Detalji porudžbine</h3>
            <p><b>Naručilac:</b> {selectedOrder.narucilac}</p>
            <p><b>Proizvod:</b> {selectedOrder.proizvod}</p>
            <p><b>Datum:</b> {selectedOrder.datum}</p>
            <p><b>Plaćanje:</b> {selectedOrder.placanje}</p>
            <p><b>Završeno:</b> {selectedOrder.zavrseno ? "Da" : "Ne"}</p>
            <button onClick={handlePrint} style={{ background: "#d90429", color: "white", marginRight: 10 }}>Print</button>
            <button onClick={() => setSelectedOrder(null)}>Zatvori</button>
          </div>
        </div>
      )}

      {/* CSS za print samo modal */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          div[style*='position: fixed'] { visibility: visible; position: static; width: auto; }
        }
        @media(max-width: 768px){
          table, input, select, button { width: 100%; margin-bottom: 5px; }
        }
      `}</style>
    </div>
  );
}
