import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

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
  const [editId, setEditId] = useState(null);

  const [enableBoje, setEnableBoje] = useState(false);
  const [enableTekstil, setEnableTekstil] = useState(false);

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

    // PWA service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const addOrUpdateOrder = async () => {
    if (editId) {
      await updateDoc(doc(db, "orders", editId), form);
      setEditId(null);
    } else {
      await addDoc(collection(db, "orders"), form);
    }

    emailjs.send(
      "service_h8z6mgs",
      "template_p2xs8ip",
      {
        narucilac: form.narucilac,
        proizvod: form.proizvod,
      },
      "O518nhvMYKnyISqzw"
    );

    loadOrders();
  };

  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    loadOrders();
  };

  const editOrder = (o) => {
    setForm(o);
    setEditId(o.id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: 10, fontFamily: "Arial", background: "#f5f5f5" }}>

      <div style={{ border: "3px solid #111", background: "white", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderBottom: "2px solid #111", background: "#111", color: "white", flexWrap: "wrap" }}>
          <img src="/logo.png" alt="logo" style={{ height: 50 }} />
          <h1 style={{ margin: 0 }}>PORUDŽBINE</h1>
        </div>

        {/* MAIN */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "2px solid #111" }} className="mainGrid">

          {/* LEFT */}
          <div style={{ padding: 10, borderRight: "2px solid #111" }}>
            <p>Naručilac:</p>
            <input name="narucilac" value={form.narucilac} onChange={handleChange} style={{ width: "100%" }} />
            <p>Proizvod:</p>
            <input name="proizvod" value={form.proizvod} onChange={handleChange} style={{ width: "100%" }} />
            <p>Datum:</p>
            <input type="date" name="datum" value={form.datum} onChange={handleChange} style={{ width: "100%" }} />
            <p>Plaćanje:</p>
            <select name="placanje" value={form.placanje} onChange={handleChange} style={{ width: "100%" }}>
              <option value="">--</option>
              <option value="kes">Keš</option>
              <option value="ziralno">Žiralno</option>
            </select>
          </div>

          {/* BOJE */}
          <div style={{ padding: 10, borderRight: "2px solid #111" }}>
            <label>
              <input type="checkbox" checked={enableBoje} onChange={() => setEnableBoje(!enableBoje)} /> Boja / Količina
            </label>
            <table border="1" width="100%" style={{ marginTop: 5, opacity: enableBoje ? 1 : 0.4 }}>
              <thead>
                <tr>
                  <th>Boja</th>
                  <th>Količina</th>
                </tr>
              </thead>
              <tbody>
                {form.boje.map((row, i) => (
                  <tr key={i}>
                    <td><input disabled={!enableBoje} value={row.boja} onChange={(e) => handleTableChange("boje", i, "boja", e.target.value)} /></td>
                    <td><input disabled={!enableBoje} value={row.kolicina} onChange={(e) => handleTableChange("boje", i, "kolicina", e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TEKSTIL */}
          <div style={{ padding: 10 }}>
            <label>
              <input type="checkbox" checked={enableTekstil} onChange={() => setEnableTekstil(!enableTekstil)} /> Tekstil
            </label>
            <table border="1" width="100%" style={{ marginTop: 5, opacity: enableTekstil ? 1 : 0.4 }}>
              <thead>
                <tr>
                  <th>Veličina / Količina</th>
                  <th>Boja</th>
                </tr>
              </thead>
              <tbody>
                {form.tekstil.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input disabled={!enableTekstil} placeholder="V" value={row.velicina} onChange={(e) => handleTableChange("tekstil", i, "velicina", e.target.value)} style={{ width: "48%" }} />
                      <input disabled={!enableTekstil} placeholder="K" value={row.kolicina} onChange={(e) => handleTableChange("tekstil", i, "kolicina", e.target.value)} style={{ width: "48%", marginLeft: "4%" }} />
                    </td>
                    <td>
                      <input disabled={!enableTekstil} value={row.boja} onChange={(e) => handleTableChange("tekstil", i, "boja", e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BUTTON */}
        <div style={{ textAlign: "center", padding: 10, borderBottom: "2px solid #111" }}>
          <button onClick={addOrUpdateOrder} style={{ padding: "10px 30px", fontWeight: "bold", background: "#d90429", color: "white", border: "none", borderRadius: 5 }}>POTVRDI</button>
          <button onClick={handlePrint} style={{ marginLeft: 10, background: "#111", color: "white", border: "none", padding: "10px 20px", borderRadius: 5 }}>PRINT</button>
        </div>

        {/* LIST */}
        <table width="100%" border="1">
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.narucilac}</td>
                <td>{o.datum}</td>
                <td>
                  <button onClick={() => setSelectedOrder(o)}>Prikaži</button>
                  <button onClick={() => editOrder(o)}>Uredi</button>
                  <button onClick={() => deleteOrder(o.id)}>Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RESPONSIVE */}
      <style>{`
        @media(max-width: 768px){
          .mainGrid{
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* MODAL */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: 20, width: "90%", maxWidth: 400 }}>
            <h3>Detalji</h3>
            <p><b>Naručilac:</b> {selectedOrder.narucilac}</p>
            <p><b>Proizvod:</b> {selectedOrder.proizvod}</p>
            <p><b>Datum:</b> {selectedOrder.datum}</p>

            <button onClick={() => setSelectedOrder(null)}>Zatvori</button>
          </div>
        </div>
      )}

    </div>
  );
}
