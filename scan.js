/* =========================================================
   Bharat.io – QR Scan Engine
   File: js/scan.js
   Purpose: Fetch QR data from Google Sheet and
            show Call / Email / Work details
========================================================= */

/* ========================
   CONFIGURATION
======================== */

/*
 STEP 1:
 Google Sheet open karo
 File → Share → Publish to web
 Format: CSV
 Copy the link

 STEP 2:
 Neeche paste karo
*/
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv";

/*
 Expected Google Sheet Columns (ORDER MAT BADLNA):

 Column A: QR_ID
 Column B: Vehicle_Number
 Column C: Mobile_Number
 Column D: Email
 Column E: Profession
 Column F: Work_Description
 Column G: Consent (YES / NO)
*/


/* ========================
   HELPER FUNCTIONS
======================== */

/* URL se query param nikalna */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* CSV ko rows me convert karna */
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(row => row.split(",").map(cell => cell.trim()));
}

/* HTML escape (safety) */
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/* ========================
   MAIN LOGIC
======================== */

const resultBox = document.getElementById("result");
const qrId = getQueryParam("id");

/* 1️⃣ QR ID missing */
if (!qrId) {
  resultBox.innerHTML = `
    <div class="center">
      <h2>Invalid QR</h2>
      <p>This QR code link is incomplete.</p>
    </div>
  `;
} else {

  /* 2️⃣ Fetch Google Sheet */
  fetch(SHEET_CSV_URL)
    .then(response => response.text())
    .then(csvText => {

      const rows = parseCSV(csvText);
      const dataRows = rows.slice(1); // header hata diya

      /* QR match karo */
      const match = dataRows.find(row => row[0] === qrId);

      /* 3️⃣ QR not registered */
      if (!match) {
        resultBox.innerHTML = `
          <div class="center">
            <h2>QR Not Registered</h2>
            <p>
              This vehicle has not been registered yet.
              Please ask the owner to complete registration.
            </p>

            <a href="register.html" class="btn btn-secondary">
              Register Vehicle
            </a>
          </div>
        `;
        return;
      }

      /* 4️⃣ Registered data */
      const phone = escapeHTML(match[2]);
      const email = escapeHTML(match[3]);
      const profession = escapeHTML(match[4]);
      const work = escapeHTML(match[5]);
      const consent = (match[6] || "").toUpperCase();

      /* Consent check */
      if (consent !== "YES") {
        resultBox.innerHTML = `
          <div class="center">
            <h2>Access Restricted</h2>
            <p>
              The vehicle owner has not enabled public
              contact for this QR code.
            </p>
          </div>
        `;
        return;
      }

      /* 5️⃣ Show contact card */
      resultBox.innerHTML = `
        ${
          profession
            ? `<div class="label">Profession</div>
               <div class="value">${profession}</div>`
            : ""
        }

        ${
          work
            ? `<div class="label">Work Description</div>
               <div class="value">${work}</div>`
            : ""
        }

        ${
          phone
            ? `<a href="tel:${phone}" class="btn btn-primary">
                 📞 Call Vehicle Owner
               </a>`
            : ""
        }

        ${
          email
            ? `<a href="mailto:${email}" class="btn btn-secondary">
                 ✉️ Email Owner
               </a>`
            : ""
        }
      `;
    })

    /* 6️⃣ Error handling */
    .catch(error => {
      console.error(error);
      resultBox.innerHTML = `
        <div class="center">
          <h2>Something Went Wrong</h2>
          <p>
            Unable to load vehicle details at the moment.
            Please try again later.
          </p>
        </div>
      `;
    });
}
