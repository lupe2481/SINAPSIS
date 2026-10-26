import openpyxl,json,collections,pathlib
root=pathlib.Path(__file__).resolve().parents[2]
w=openpyxl.load_workbook(root/'recursos/sources/historico.xlsx',read_only=True,data_only=True)
counts=collections.defaultdict(lambda:collections.Counter()); names={}
for r in w.active.iter_rows(min_row=2,values_only=True):
 if r[4]=='Feminicidio' and r[7]=='Mujer':
  names[r[1]]={'Coahuila de Zaragoza':'Coahuila','Michoacán de Ocampo':'Michoacán','Veracruz de Ignacio de la Llave':'Veracruz','México':'Estado de México'}.get(r[2],r[2]); counts[r[0]][r[1]]+=sum(x or 0 for x in r[9:21])
# SESNSP September 2026 report, page 11. Female victims, January–September.
latest={'Sinaloa':97,'Estado de México':38,'Tamaulipas':34,'Ciudad de México':29,'Chiapas':28,'Chihuahua':28,'Morelos':27,'Jalisco':22,'Guanajuato':20,'Sonora':20,'Guerrero':17,'Veracruz':17,'Michoacán':14,'Nuevo León':13,'Oaxaca':12,'Puebla':10,'Quintana Roo':10,'Tabasco':10,'Baja California':9,'Coahuila':9,'Durango':8,'San Luis Potosí':7,'Zacatecas':7,'Baja California Sur':5,'Campeche':5,'Querétaro':5,'Yucatán':4,'Aguascalientes':3,'Colima':3,'Hidalgo':3,'Nayarit':2,'Tlaxcala':2}
for key,name in names.items():counts[2026][key]=latest[name]
assert sum(counts[2026].values())==518
expected=[428,648,769,925,972,975,1022,985,853,858,736]
actual=[sum(counts[y].values()) for y in range(2015,2026)]
print('Historical annual totals:',actual,'PDF:',expected)
assert actual==expected,(actual,expected)
fear=[76.2,75.3,76.9,82.1,82.0,81.7,78.8,79.4,78.6,77.3,79.4,77.4]
data={'startYear':2015,'endYear':2026,'cutoff':'2026-09-30','states':[{'id':k,'name':names[k]} for k in sorted(names)],'years':{y:{'total':sum(counts[y].values()),'states':dict(counts[y]),'perception':fear[y-2015],'partial':y==2026} for y in range(2015,2027)}}
(root/'recursos/data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print('Cumulative',sum(sum(v.values()) for v in counts.values()))
