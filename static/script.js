
let nomeEmEdicao = null;

// carrega os municípios
async function carregarMunicipios(url = "/municipios") {

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao carregar municípios");
        }
        exibirMunicipios(dados);

    } catch (erro) {

        document.getElementById("mensagem").textContent = erro.message;
    }
}

// exibe os municípios na tabela
function exibirMunicipios(municipios) {

    const tabela = document.getElementById("tabelaMunicipios");
    tabela.innerHTML = "";
    const lista = Object.entries(municipios);
    document.getElementById("totalMunicipios").textContent = lista.length;

    if (lista.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 6;
        celula.textContent = "Nenhum município encontrado.";

        linha.appendChild(celula);
        tabela.appendChild(linha);

        return;
    }
    lista.forEach(([nome, dados]) => {

        const linha = document.createElement("tr");
        const informacoes = [

            nome,
            dados.sigla_uf,
            dados.capital ? "Sim" : "Não",
            Number(dados.populacao_estimada).toLocaleString("pt-BR"),
            dados.id_ibge
        ];

        informacoes.forEach(valor => {

            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);

        });
        const acoes = document.createElement("td");

        // botão de editar
        const botaoEditar = document.createElement("button");

        botaoEditar.textContent = "Editar";
        botaoEditar.className = "btn btn-primary btn-sm me-1";
        botaoEditar.addEventListener("click", function() {

            editarMunicipio(nome, dados);

        });
        // botão de excluir

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "btn btn-danger btn-sm";

        botaoExcluir.addEventListener("click", function() {

            excluirMunicipio(nome);

        });
        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);
        linha.appendChild(acoes);
        tabela.appendChild(linha);
    });

}
// cadastrar ou atualizar
document.getElementById("formMunicipio").addEventListener("submit", async function(event) {

    event.preventDefault();
    const dados = {

        nome: document.getElementById("nome").value.trim(),
        id_ibge: Number(document.getElementById("id_ibge").value),
        estado: document.getElementById("estado").value.trim(),
        sigla_uf: document.getElementById("sigla_uf").value.trim().toUpperCase(),
        capital: document.getElementById("capital").checked,
        populacao_estimada: Number(document.getElementById("populacao").value)

    };
    try {

        let url = "/municipios";
        let metodo = "POST";
        if (nomeEmEdicao !== null) {

            url = "/municipios/" + encodeURIComponent(nomeEmEdicao);
            metodo = "PATCH";

        }
        const resposta = await fetch(url, {

            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao salvar município");
        }

        alert(resultado.mensagem);
        limparFormulario();
        carregarMunicipios();

    } catch (erro) {
        alert(erro.message);
    }
});
// editar o município

function editarMunicipio(nome, dados) {

    nomeEmEdicao = nome;
    document.getElementById("nome").value = nome;
    document.getElementById("nome").disabled = true;
    document.getElementById("id_ibge").value = dados.id_ibge;
    document.getElementById("estado").value = dados.estado;
    document.getElementById("sigla_uf").value = dados.sigla_uf;
    document.getElementById("capital").checked = dados.capital;
    document.getElementById("populacao").value = dados.populacao_estimada;

}
// excluir o município
async function excluirMunicipio(nome) {

    if (!confirm("Deseja realmente excluir " + nome + "?")) {
        return;
    }
    try {
        const resposta = await fetch("/municipios/" + encodeURIComponent(nome), {
            method: "DELETE"

        });
        const resultado = await resposta.json();
        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao excluir município");
        }

        alert(resultado.mensagem);
        carregarMunicipios();

    } catch (erro) {

        alert(erro.message);

    }
}
// busca pelo nome
async function buscarPorNome() {
    const nome = document.getElementById("buscaNome").value.trim();
    if (!nome) {
        alert("Digite o nome de um município.");
        return;
    }
    carregarMunicipios("/municipios/" + encodeURIComponent(nome));
}
// filtro por UF
function filtrarPorUF() {

    const uf = document.getElementById("filtroUF").value.trim().toUpperCase();
    if (!uf) {
        alert("Informe uma sigla de estado.");
        return;
    }
    carregarMunicipios("/municipios?uf=" + encodeURIComponent(uf));
}

// limpa os filtros
function limparFiltros() {

    document.getElementById("buscaNome").value = "";
    document.getElementById("filtroUF").value = "";
    carregarMunicipios();

}

// limpa os form
function limparFormulario() {
    document.getElementById("formMunicipio").reset();
    document.getElementById("nome").disabled = false;
    nomeEmEdicao = null;

}
// carrega os dados quando abre a página

document.addEventListener("DOMContentLoaded", function() {
    carregarMunicipios();

});
