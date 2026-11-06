import json
from io import BytesIO
from flask import Flask, render_template, request, jsonify, send_file

app = Flask(__name__)

@app.route("/")
def inicio():
    return render_template("index.html")

municipios_nordeste_dataset = {
    "metadados": {
        "regiao": "Nordeste",
        "pais": "Brasil",
        "total_municipios": 30,
        "fonte_dados_populacao": "IBGE"
    },

    "municipios": {

        "Fortaleza": {
            "id_ibge": 2304400,
            "estado": "Ceará",
            "sigla_uf": "CE",
            "capital": True,
            "populacao_estimada": 2582360
        },

        "Salvador": {
            "id_ibge": 2927408,
            "estado": "Bahia",
            "sigla_uf": "BA",
            "capital": True,
            "populacao_estimada": 2559945
        }

    }
}
@app.route("/municipios", methods=["GET"])
def listar_municipios():

    uf = request.args.get("uf")

    municipios = municipios_nordeste_dataset["municipios"]

    if uf:
        filtrados = {}

        for nome, dados in municipios.items():
            if dados["sigla_uf"] == uf.upper():
                filtrados[nome] = dados

        return jsonify(filtrados)

    return jsonify(municipios)


@app.route("/municipios/<nome>", methods=["GET"])
def consultar_municipio(nome):

    municipios = municipios_nordeste_dataset["municipios"]
    municipio = municipios.get(nome)

    if municipio is None:
        return jsonify({"erro": "Município não encontrado"}), 404

    return jsonify({nome: municipio})


@app.route("/municipios", methods=["POST"])
def cadastrar_municipio():

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados JSON inválidos"}), 400

    nome = dados.get("nome")

    if not nome or not nome.strip():
        return jsonify({"erro": "Informe o nome do município"}), 400

    nome = nome.strip()

    municipios = municipios_nordeste_dataset["municipios"]

    if nome in municipios:
        return jsonify({"erro": "Município já cadastrado"}), 409

    campos_obrigatorios = [
        "id_ibge",
        "estado",
        "sigla_uf",
        "capital",
        "populacao_estimada"
    ]

    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({"erro": f"Campo ausente: {campo}"}), 400

    novo_municipio = {
        "id_ibge": dados["id_ibge"],
        "estado": dados["estado"],
        "sigla_uf": dados["sigla_uf"].upper(),
        "capital": dados["capital"],
        "populacao_estimada": dados["populacao_estimada"]
    }

    municipios[nome] = novo_municipio

    return jsonify({
        "mensagem": "Município cadastrado com sucesso",
        "municipio": novo_municipio
    }), 201


@app.route("/municipios/<nome>", methods=["PATCH"])
def atualizar_municipio(nome):

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados JSON inválidos"}), 400

    municipios = municipios_nordeste_dataset["municipios"]
    municipio = municipios.get(nome)

    if municipio is None:
        return jsonify({"erro": "Município não encontrado"}), 404

    campos_permitidos = [
        "id_ibge",
        "estado",
        "sigla_uf",
        "capital",
        "populacao_estimada"
    ]
    for campo, valor in dados.items():
        if campo in campos_permitidos:
            municipio[campo] = valor

    return jsonify({
        "mensagem": "Município atualizado com sucesso",
        "municipio": municipio
    })

@app.route("/municipios/<nome>", methods=["DELETE"])
def excluir_municipio(nome):

    municipios = municipios_nordeste_dataset["municipios"]

    if nome not in municipios:
        return jsonify({"erro": "Município não encontrado"}), 404

    municipios.pop(nome)

    return jsonify({
        "mensagem": "Município excluído com sucesso"
    })


@app.route("/municipios/json", methods=["GET"])
def baixar_json():

    conteudo = json.dumps(
        municipios_nordeste_dataset,
        ensure_ascii=False,
        indent=4
    )

    arquivo = BytesIO(conteudo.encode("utf-8"))

    return send_file(
        arquivo,
        mimetype="application/json",
        as_attachment=True,
        download_name="municipios_nordeste.json"
    )

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
