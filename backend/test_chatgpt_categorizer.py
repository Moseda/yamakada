import time

start_time = time.time()


import chatGPTAPICategorizer as chatgpt

starttime = time.time()

articles = []
articles.append("HELLA 2PS 004 361-001 Seitenmarkierungsleuchte - 12/24V - Anbau - Lichtscheibenfarbe: gelb - links")
articles.append("Berufsschuh DRIFTER BLACK ST LOW Gr.46 schwarz Mikrofaser/Ripstop Textil")
articles.append("Damen-Sicherheitsschuhe Cofra Alice S3 SRC Gr. 36")
articles.append("Damensicherheitsschuh Knit Blue Wns Low Gr.42 blau/grün S1P HRO SRC EN20345")
articles.append("Arbeitsdrehstuhl PROMAT Bodengleiter Integralschaum schwarz 440-620mm PROMAT")

categories = []
categories.append("Auto")
categories.append("Haus")
categories.append("Schuh")
categories.append("Damenschuh")
categories.append("Kleidung")
categories.append("KFZ")


print(chatgpt.chatgpt_categorizer(categories[:20], articles[:10]))



print(time.time()-starttime)
