import { db } from "./firebase.js";
import { collection, addDoc, Timestamp, query, orderBy, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    // Token: 9bR7xP2qF43Kz9uMvyA1cL6TfYwX8dH0e
    const q = query(collection(db, "token"));
    const querySnapshot = await getDocs(q);

    const params = new URLSearchParams(window.location.search);
    let gToken = params.get("token");
    let valid;
    querySnapshot.forEach((doc) => {
        valid = doc.data().token == gToken;
        if (valid) return;
    });
    if (!valid) {
        document.body.innerHTML = "<h1 style='color: black; text-align: center; margin-top: 50px;'>Nincs jogosultság a hozzáféréshez!</h1>";
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "white";
    }

    const popup = document.getElementById("popup");
    const blur = document.getElementById("blur");
    const table = document.getElementById("data_table");

    document.getElementById("add_content").addEventListener("click", () => {
        popup.style.display = "block";
        blur.style.display = "block";
    });

    document.getElementById("close_button").addEventListener("click", closePopup);
    document.getElementById("save").addEventListener("click", saveData);

    function closePopup() {
        document.getElementById("reasons").value = "";
        document.getElementById("additional_amount").value = "";
        document.getElementById("name").value = "";
        
        popup.style.display = "none";
        blur.style.display = "none";
    }

    async function saveData() {
        const reason = document.getElementById("reasons").value;
        const amount = Number(document.getElementById("additional_amount").value);
        const name = document.getElementById("name").value;

        if (!reason || !amount || !name) {
            alert("Minden mezőt ki kell tölteni!");
            return;
        }

        try {
            await addDoc(collection(db, "transactions"), {
                reason,
                additional_amount: amount,
                name,
                date: Timestamp.now()
            });

            document.getElementById("reasons").value = "";
            document.getElementById("additional_amount").value = "";
            document.getElementById("name").value = "";

            closePopup();
            loadData();
        } catch (e) {
            console.error("Hiba a mentéskor:", e);
            alert("Nem sikerült menteni.");
        }
    }

    // Betölti az adatokat
    async function loadData() {
        // Töröljük az eddigi adat sorokat (de nem a fejlécet)
        table.querySelectorAll("tr.data-row").forEach(row => row.remove());

        const q = query(collection(db, "transactions"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const docs = [];
        querySnapshot.forEach(docSnap => docs.push({ id: docSnap.id, data: docSnap.data() }));

        // Teljes összeg időrendi sorrendben (régi → új)
        let totalSum = 0;
        for (let i = docs.length - 1; i >= 0; i--) {
            totalSum += docs[i].data.additional_amount;
            docs[i].totalSum = totalSum;
        }

        // Megjelenítés legfrissebb fent
        docs.forEach((docItem, index) => {
            const data = docItem.data;
            const tr = document.createElement("tr");
            tr.classList.add("data-row");
            tr.dataset.id = docItem.id; // tároljuk az id-t

            const date = data.date?.toDate ? data.date.toDate() : new Date();
            const formattedDate = date.toLocaleDateString("hu-HU");

            tr.innerHTML = `
                <td>${data.reason}</td>
                <td>${docItem.totalSum} Ft</td>
                <td>${data.additional_amount} Ft</td>
                <td>${formattedDate}</td>
                <td>${data.name}</td>
            `;

            // Csak az első sor legyen törölhető
            if (index === 0) {
                // Kattintás törléshez (gép)
                tr.addEventListener("click", async () => {
                    if (confirm("Biztosan törlöd az első rekordot?")) {
                        await deleteDoc(doc(db, "transactions", docItem.id));
                        loadData();
                    }
                });

                // Hosszú érintés törléshez (mobil)
                let pressTimer;
                tr.addEventListener("touchstart", () => {
                    pressTimer = setTimeout(async () => {
                        if (confirm("Biztosan törlöd az első rekordot?")) {
                            await deleteDoc(doc(db, "transactions", docItem.id));
                            loadData();
                        }
                    }, 800);
                });
                tr.addEventListener("touchend", () => {
                    clearTimeout(pressTimer);
                });
            }

            table.appendChild(tr);
        });
    }

    loadData();
});
