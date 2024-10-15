// import { remetentes, destinatarios, tecnicos } from "./mock.js";
const tbody = document.querySelector("tbody");
const btnAddEquipamento = document.querySelector("#addEquipamento");
const inputEquipamento = document.querySelectorAll('[id^="equipamento_"]');
const modal = new bootstrap.Modal(document.getElementById("rat"));
let equipamentos = [];
let rat = [];
let destinatarios = [];
let remetentes = [];
let tecnicos = [];

const form = document.querySelector("#form");
const selectRemetentes = document.querySelector("#remetentes");
const selectDestinatarios = document.querySelector("#destinatarios");
const selectTecnicos = document.querySelector("#tecnicos");
const searchEquipamento = document.getElementById("searchEquipamento");

uploadFile.addEventListener("change", (e) => {
  let file = e.target.files[0];

  let read = new FileReader();
  read.readAsText(file, "UTF-8");
  read.onloadend = () => {
    rat = JSON.parse(read.result).rat;
    remetentes = JSON.parse(read.result).remetentes;
    destinatarios = JSON.parse(read.result).destinatarios;
    tecnicos = JSON.parse(read.result).tecnicos;

    for (const tecnico of tecnicos) {
      const option = document.createElement("option");
      option.value = tecnico.id;
      option.text = tecnico.nome;
      selectTecnicos.appendChild(option);
    }

    for (const remetente of remetentes) {
      const option = document.createElement("option");
      option.value = remetente.id;
      option.text = remetente.nome;
      selectRemetentes.appendChild(option);
    }

    for (const destinatario of destinatarios) {
      const option = document.createElement("option");
      option.value = destinatario.id;
      option.text = `${destinatario.nome} (${destinatario.descricao})`;
      selectDestinatarios.appendChild(option);
    }

  };
})

function listRat(items) {
  let ratList = document.getElementById('ratList');
  ratList.innerHTML = "";

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
    `;

    let selectTd = document.createElement("td");
    selectTd.classList.add("text-center")
    let selectBtn = document.createElement("button");
    selectBtn.addEventListener('click', () => selectEquipamento(item.chamado_it2b))
    selectBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
    selectTd.appendChild(selectBtn);
    row.appendChild(selectTd);

    ratList.append(row);
  });
}

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

function selectEquipamento(id) {
  let item = rat.find(i => i.chamado_it2b === id)

  let equipamento_chamado = document.getElementById('equipamento_chamado');
  let equipamento_patrimonio = document.getElementById('equipamento_patrimonio');
  let equipamento_descricao = document.getElementById('equipamento_descricao');

  equipamento_chamado.value = item.chamado_it2b;
  equipamento_patrimonio.value = item.patrimonio_equipamento;
  equipamento_descricao.value = `${item.tipo_equipamento} ${item.fornecedor_equipamento} ${item.modelo_equipamento}`

  modal.hide();
}

searchEquipamento.addEventListener('click', () => {
  modal.show();
  listRat(rat);
})

selectRemetentes.onchange = () => {
  const remetenteFields = document.querySelectorAll('[id^="remetente_"]');
  const option = selectRemetentes.value;
  const remetente = option == '0' ? {} : remetentes.find(remetente => remetente.id == option);

  for (const field of remetenteFields) {
    if (option == '0') { field.value = ''; continue };
    field.value = remetente[field.id.slice(10)];
  }
}

selectDestinatarios.onchange = () => {
  const destinatarioFields = document.querySelectorAll('[id^="destinatario_"]');
  const option = selectDestinatarios.value;
  const destinatario = option == '0' ? {} : destinatarios.find(destinatario => destinatario.id == option);

  for (const field of destinatarioFields) {
    if (option == '0') { field.value = ''; continue };
    field.value = destinatario[field.id.slice(13)];
  }
}

selectTecnicos.onchange = () => {
  const tecnicoFields = document.querySelectorAll('[id^="tecnico_"]');
  const option = selectTecnicos.value;
  const tecnico = option == '0' ? {} : tecnicos.find(tecnico => tecnico.id == option);

  for (const field of tecnicoFields) {
    if (option == '0') { field.value = ''; continue };
    field.value = tecnico[field.id.slice(8)];
  }
}

// Adiciona um equipamento a tabela de equipamentos, que será utilizada em Declaração Correios e Carta Reversa.
btnAddEquipamento.onclick = () => {
  let obj = {};

  for (const input of inputEquipamento) {
    obj[input.id] = input.value;
    input.value = "";
  }

  console.log(obj);
  equipamentos.push(obj);

  listItems(equipamentos);
}

function listItems(items) {
  tbody.innerHTML = "";

  items.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.equipamento_chamado}</td>
      <td>${item.equipamento_patrimonio}</td>
      <td>${item.equipamento_descricao}</td>
      <td>${parseFloat(item.equipamento_valor_unitario).toLocaleString('pt-br',
      { minimumFractionDigits: 2 })}</td>
      <td>${item.equipamento_nf}</td>
      <td>${new Date(item.equipamento_data_nf).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
      <td>${item.equipamento_quantidade}</td>
      <td>${item.equipamento_peso}</td>
    `;

    let tdDelete = document.createElement("td");
    tdDelete.classList.add("text-center");
    let deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`;
    deleteBtn.onclick = () => deleteEquipamento(item.equipamento_chamado);
    tdDelete.appendChild(deleteBtn);

    row.appendChild(tdDelete);
    tbody.append(row);
  });
}

const deleteEquipamento = (equipamento_chamado) => {
  let newEquipamentos = equipamentos.filter((item, i) => item.equipamento_chamado != equipamento_chamado);
  equipamentos = newEquipamentos;
  listItems(equipamentos);
}

const btnPrintDeclaracao = document.getElementById('btnPrintDeclaracao');

// Cria uma Declaração Correios para impressão
btnPrintDeclaracao.addEventListener("click", () => {
  const formData = new FormData(form);

  // const item = rat.find(item => item.id === id);

  let printWindow = window.open('./assets/declaracao/index.html');
  printWindow.form = formData;
  printWindow.equipamentos = equipamentos;
  printWindow.addEventListener("load", () => {
    printWindow.document.title = "Declaração Correios";
    const lista_equipamentos = printWindow.equipamentos;

    for (const pair of printWindow.form.entries()) {
      // console.log(pair);
      if (pair[0] === 'remetente_cidade') {
        // Obtém o span cidade e dia e atribui o valor cidade
        let span_cidade_hora = printWindow.document.getElementById('cidade_dia');
        span_cidade_hora.innerHTML = `${pair[1]}, `;

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = today.toLocaleString('default', { month: 'long' });
        let yyyy = String(today.getFullYear()).padStart(2, '0');

        let todayTextNode = printWindow.document.createTextNode(`${dd} de ${mm.toUpperCase()} de ${yyyy}`);
        span_cidade_hora.appendChild(todayTextNode);
      }

      if (pair[0] === 'destinatario_bairro') {
        let span_endereco = printWindow.document.getElementById('destinatario_endereco');

        let bairroTextNode = printWindow.document.createTextNode(` - ${pair[1]}`);
        span_endereco.appendChild(bairroTextNode);
      }

      if (pair[0] === 'destinatario_uf') {
        let span_cidade = printWindow.document.getElementById('destinatario_cidade');

        let cidadeTextNode = printWindow.document.createTextNode(` - ${pair[1]}`);
        span_cidade.appendChild(cidadeTextNode);
      }

      let span = printWindow.document.getElementById(pair[0]);

      if (span === null) continue;

      let text = printWindow.document.createTextNode(pair[1]);
      span.appendChild(text);

    }

    let valor_total = 0;

    for (let i = 0; i < lista_equipamentos.length; i++) {
      const span_equipamento_descricao = printWindow.document.getElementById(`equipamento_descricao${i + 1}`);
      const span_equipamento_quantidade = printWindow.document.getElementById(`equipamento_quantidade${i + 1}`);
      const span_equipamento_peso = printWindow.document.getElementById(`equipamento_peso${i + 1}`);

      span_equipamento_descricao.innerHTML = lista_equipamentos[i].equipamento_descricao;
      span_equipamento_quantidade.innerHTML = lista_equipamentos[i].equipamento_quantidade;
      span_equipamento_peso.innerHTML = lista_equipamentos[i].equipamento_peso + "g";

      const valor_unitario = lista_equipamentos[i].equipamento_valor_unitario;
      const quantidade = lista_equipamentos[i].equipamento_quantidade;

      valor_total += valor_unitario * quantidade;
    }

    const span_valor_total = printWindow.document.getElementById('valor_total');
    span_valor_total.innerHTML = valor_total.toLocaleString('pt-br',
      { minimumFractionDigits: 2 });

    printWindow.print();
    setTimeout(() => printWindow.close(), 0);
  }, true)
});

const btnPrintReversa = document.getElementById('btnPrintReversa');

btnPrintReversa.addEventListener("click", () => {
  const formData = new FormData(form);

  let printWindow = window.open('./assets/reversa/index.html');
  printWindow.form = formData;
  printWindow.equipamentos = equipamentos;
  printWindow.addEventListener("load", () => {
    printWindow.document.title = "Reversa - " + printWindow.form.get('equipamento_chamado');
    const lista_equipamentos = printWindow.equipamentos;
    console.log(lista_equipamentos);

    for (const pair of printWindow.form.entries()) {

      if (pair[0] === 'remetente_cidade') {
        // Obtém o span cidade e dia e atribui o valor cidade
        let span_cidade_dia = printWindow.document.getElementById('cidade_dia');
        span_cidade_dia.innerHTML = `${pair[1]}, `;

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = today.toLocaleString('default', { month: 'long' });
        let yyyy = String(today.getFullYear()).padStart(2, '0');

        let todayTextNode = printWindow.document.createTextNode(`${dd} de ${mm} de ${yyyy}.`);
        span_cidade_dia.appendChild(todayTextNode);
      }

      let span = printWindow.document.getElementById(pair[0]);

      if (span === null) continue;

      console.log(pair);

      let text = printWindow.document.createTextNode(pair[1]);
      span.appendChild(text);

    }

    let valor_total = 0;

    for (let i = 0; i < lista_equipamentos.length; i++) {

      // Criar mais linhas na tabela de equipamentos da carta reversa
      if (i > 1) {
        let table_body = printWindow.document.querySelector('tbody');

        let tr = printWindow.document.createElement('tr');
        tr.innerHTML = `<td id='equipamento_chamado${i + 1}'>
                        <td id='equipamento_patrimonio${i + 1}'>
                        <td id='equipamento_nf${i + 1}'>
                        <td id='equipamento_data_nf${i + 1}'>
                        <td id='equipamento_descricao${i + 1}'>
                        <td id='equipamento_quantidade${i + 1}'>
                        <td id='equipamento_valor_unitario${i + 1}'>`;
        table_body.appendChild(tr);
      }

      const span_chamado = printWindow.document.getElementById(`equipamento_chamado${i + 1}`);
      const span_data_nf = printWindow.document.getElementById(`equipamento_data_nf${i + 1}`);
      const span_descricao = printWindow.document.getElementById(`equipamento_descricao${i + 1}`);
      const span_nf = printWindow.document.getElementById(`equipamento_nf${i + 1}`);
      const span_patrimonio = printWindow.document.getElementById(`equipamento_patrimonio${i + 1}`);
      const span_quantidade = printWindow.document.getElementById(`equipamento_quantidade${i + 1}`);
      const span_valor_unitario = printWindow.document.getElementById(`equipamento_valor_unitario${i + 1}`);

      span_chamado.innerHTML = lista_equipamentos[i].equipamento_chamado;
      span_data_nf.innerHTML = new Date(lista_equipamentos[i].equipamento_data_nf).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      span_descricao.innerHTML = lista_equipamentos[i].equipamento_descricao;
      span_nf.innerHTML = lista_equipamentos[i].equipamento_nf;
      span_patrimonio.innerHTML = lista_equipamentos[i].equipamento_patrimonio;
      span_quantidade.innerHTML = lista_equipamentos[i].equipamento_quantidade;
      span_valor_unitario.innerHTML = parseFloat(lista_equipamentos[i].equipamento_valor_unitario).toLocaleString('pt-br',
        { minimumFractionDigits: 2 });


      const valor_unitario = lista_equipamentos[i].equipamento_valor_unitario;
      const quantidade = lista_equipamentos[i].equipamento_quantidade;

      valor_total += valor_unitario * quantidade;
    }

    const span_valor_total = printWindow.document.getElementById('valor_total');
    span_valor_total.innerHTML = valor_total.toLocaleString('pt-br',
      { minimumFractionDigits: 2 });

    printWindow.print();
    setTimeout(() => printWindow.close(), 0);
  }, true)
});

const btnPrintEtiqueta = document.getElementById('btnPrintEtiqueta');

btnPrintEtiqueta.addEventListener("click", () => {
  const formData = new FormData(form);

  let printWindow = window.open('./assets/etiqueta/index.html');
  printWindow.form = formData;
  printWindow.equipamentos = equipamentos;
  printWindow.addEventListener("load", () => {
    printWindow.document.title = "Etiqueta IT2B";

    for (const pair of printWindow.form.entries()) {
      console.log(pair[0], pair[1]);

      if (pair[0].includes('_bairro')) {
        let field_name = pair[0].split('_')

        // Obtém o span cidade e dia e atribui o valor cidade
        let span_bairro = printWindow.document.getElementById(pair[0]);
        let txtCidade = printWindow.form.get(`${field_name[0]}_cidade`)
        let txtUf = printWindow.form.get(`${field_name[0]}_uf`)
        span_bairro.innerHTML = `${pair[1]}, ${txtCidade} - ${txtUf}`;

        continue;
      }

      let span = printWindow.document.getElementById(pair[0]);

      if (span === null) continue;
      let text = printWindow.document.createTextNode(pair[1]);
      span.appendChild(text);

    }

    printWindow.print();
    setTimeout(() => printWindow.close(), 0);
  }, true)
});
