from sentence_transformers import SentenceTransformer, util # type: ignore

model = SentenceTransformer('paraphrase-MiniLM-L6-v2')


query = "Auto kaufen"
liste = ["Fahrzeugverkauf", "Autovermietung", "Autohaus", "Fahrradladen"]

query_embedding = model.encode(query, convert_to_tensor=True)
list_embeddings = model.encode(liste, convert_to_tensor=True)

cosine_scores = util.cos_sim(query_embedding, list_embeddings)

for i, score in enumerate(cosine_scores[0]):
    print(f"{liste[i]}: Ähnlichkeit = {score:.4f}")