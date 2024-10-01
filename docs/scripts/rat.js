const tbody = document.querySelector("tbody");
const modal = new bootstrap.Modal(document.getElementById("rat"));
const form = document.querySelector("form");
const btnPrint = document.getElementById("btnPrint");
const uploadFile = document.getElementById("uploadFile");
const downloadJson = document.getElementById("downloadJson");

let rat = [];
let destinatarios = [];
let remetentes = [];
let tecnicos = [];
let id;

uploadFile.addEventListener("change", (e) => {
  let file = e.target.files[0];

  let read = new FileReader();
  read.readAsText(file, "UTF-8");
  read.onloadend = () => {
    rat = JSON.parse(read.result).rat;
    remetentes = JSON.parse(read.result).remetentes;
    destinatarios = JSON.parse(read.result).destinatarios;
    tecnicos = JSON.parse(read.result).tecnicos;

    listItems(rat)

  };
})

function listItems(items) {
  tbody.innerHTML = "";

  items.forEach(item => {
    const row = document.createElement("tr");
    row.classList.add("rat");
    row.innerHTML = `
      <td>${item.chamado_it2b}</td>
      <td>${item.cliente_cidade}</td>
      <td>${item.tipo_equipamento}</td>
      <td title="${item.anormalidade_constatada}">
        ${item.anormalidade_constatada.length > 20 ? item.anormalidade_constatada.slice(0, 20) + "..." : item.anormalidade_constatada}
      </td>
      <td>${item.nome_tecnico}</td>
      <td>${new Date(item.data_fechamento).toLocaleDateString()}</td>
      <td class="text-center">
        <button onclick="openModal(true, '${item.chamado_it2b}')">
          <i class="bi bi-pencil-square"></i>
        </button>
      </td>
      <td class="text-center">
        <button onclick="deleteItem('${item.chamado_it2b}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.append(row);
  });
}

function editItem(id) {
  const item = rat.find(item => item.chamado_it2b === id);

  for (key in item) {
    let input = document.getElementById(`${key}`);

    if (input === null) continue;

    if (key.includes("data")) {
      if (key === "data_abertura" || key === "data_fechamento") {
        const date = new Date(item[key]);
        input.value = date.toISOString().slice(0, 23);
        continue;
      } else {
        continue;
      }
    }

    input.value = item[key];

  }
}

function closeModal() {
  modal.hide();
  form.reset();
}

function openModal(edit = false, index = null) {
  modal.show();

  if (edit) {
    editItem(index);
    id = index;
  }
}

form.onsubmit = e => {
  let newList = [];

  e.preventDefault();

  if (id) {
    newList = rat.filter(obj => obj.chamado_it2b !== id);
    let newRat = Object.fromEntries(new FormData(e.target));
    newList.push(newRat);
    rat = newList;
  } else {
    let newRat = Object.fromEntries(new FormData(e.target));
    rat.push(newRat);
  }

  listItems(rat);

  window.alert("Salvamento concluído")
};

function deleteItem(id) {
  if (confirm(`Tem certeza que deseja excluir a RAT ${id}?`)) {
    let newList = rat.filter(obj => obj.chamado_it2b !== id);
    rat = newList;

    listItems(rat);
  }

  window.alert(`RAT ${id} excluída com êxito`)

};

btnPrint.addEventListener("click", () => {
  const formData = new FormData(form);

  // const item = rat.find(item => item.id === id);

  let ratWindow = window.open('./assets/rat/index.html');
  ratWindow.form = formData;
  ratWindow.addEventListener("load", () => {
    // let partnumber = 0;

    ratWindow.document.title = "RAT_" + ratWindow.form.get('chamado_it2b');

    for (const pair of ratWindow.form.entries()) {
      // console.log(pair[0], pair[1])
      let span = ratWindow.document.getElementById(pair[0]);

      // A chave ID não possui um campo no HTML, por isso ele é ignorado
      if (span === null || span.id.includes('hora_')) continue;

      if (pair[0].includes("data")) {
        if (pair[0] === "data_abertura" || pair[0] === "data_fechamento") {
          let hora = ratWindow.document.getElementById(`hora_${pair[0].slice(5)}`);

          span.innerHTML = new Date(pair[1].slice(0, 10)).toLocaleDateString('pt-br', { dateStyle: 'short' });
          hora.innerHTML = pair[1].slice(11, 23);
          continue;
        } else {
          continue
        }
      }

      let text = ratWindow.document.createTextNode(pair[1]);
      span.appendChild(text);

    }

    ratWindow.print();
    setTimeout(() => ratWindow.close(), 0);
  }, true)
});

const searchRat = (e) => {
  let searchQuery = e.target.value.toLowerCase();
  let allRatDOMCollection = document.getElementsByClassName('rat');

  for (let counter = 0; counter < allRatDOMCollection.length; counter++) {
    const currentRAT = allRatDOMCollection[counter].firstElementChild.textContent.toLowerCase();

    if (currentRAT.includes(searchQuery)) {
      allRatDOMCollection[counter].style.display = "table-row";
    } else {
      allRatDOMCollection[counter].style.display = "none";
    }
  }
}

downloadJson.addEventListener("click", () => {

  let filename = 'data.json'

  const objects = {
    "tecnicos": tecnicos,
    "remetentes": remetentes,
    "destinatarios": destinatarios,
    "rat": rat,
  }

  // Convert the JSON object to a string
  const jsonStr = JSON.stringify(objects, null, 2);

  // Create a Blob from the JSON string
  const blob = new Blob([jsonStr], { type: 'application/json' });

  // Create an object URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // Set the file name

  // Append the anchor to the document (not necessary to display it)
  document.body.appendChild(a);

  // Programmatically click the anchor to trigger the download
  a.click();

  // Remove the anchor from the document
  document.body.removeChild(a);

  // Revoke the object URL to free up memory
  URL.revokeObjectURL(url);
});
