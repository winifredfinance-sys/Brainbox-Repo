/* Nigeria's 36 states and the FCT: capital, geopolitical zone and how well known the capital is
   (tier 1 = most people know it, 3 = harder). Used to make Naija Knowledge questions for every band. */
export const ZONES=['North Central','North East','North West','South East','South South','South West'];
export const STATES=[
 ['Abia','Umuahia','South East',2],['Adamawa','Yola','North East',2],['Akwa Ibom','Uyo','South South',2],
 ['Anambra','Awka','South East',2],['Bauchi','Bauchi','North East',1],['Bayelsa','Yenagoa','South South',3],
 ['Benue','Makurdi','North Central',2],['Borno','Maiduguri','North East',1],['Cross River','Calabar','South South',1],
 ['Delta','Asaba','South South',2],['Ebonyi','Abakaliki','South East',3],['Edo','Benin City','South South',1],
 ['Ekiti','Ado-Ekiti','South West',2],['Enugu','Enugu','South East',1],['Gombe','Gombe','North East',1],
 ['Imo','Owerri','South East',2],['Jigawa','Dutse','North West',3],['Kaduna','Kaduna','North West',1],
 ['Kano','Kano','North West',1],['Katsina','Katsina','North West',1],['Kebbi','Birnin Kebbi','North West',3],
 ['Kogi','Lokoja','North Central',2],['Kwara','Ilorin','North Central',1],['Lagos','Ikeja','South West',1],
 ['Nasarawa','Lafia','North Central',3],['Niger','Minna','North Central',2],['Ogun','Abeokuta','South West',1],
 ['Ondo','Akure','South West',2],['Osun','Osogbo','South West',2],['Oyo','Ibadan','South West',1],
 ['Plateau','Jos','North Central',1],['Rivers','Port Harcourt','South South',1],['Sokoto','Sokoto','North West',1],
 ['Taraba','Jalingo','North East',3],['Yobe','Damaturu','North East',3],['Zamfara','Gusau','North West',3]
].map(([state,capital,zone,tier])=>({state,capital,zone,tier}));
/* Towns and cities that are not state capitals: [town, state, level] */
export const TOWNS=[
 ['Onitsha','Anambra',1],['Aba','Abia',1],['Warri','Delta',1],['Zaria','Kaduna',1],['Ogbomoso','Oyo',2],['Nsukka','Enugu',2],
 ['Ile-Ife','Osun',1],['Badagry','Lagos',1],['Ijebu-Ode','Ogun',2],['Nnewi','Anambra',2],['Sapele','Delta',3],['Okene','Kogi',3],
 ['Bida','Niger',3],['Potiskum','Yobe',3],['Ikot Ekpene','Akwa Ibom',3],['Bonny','Rivers',3],['Kafanchan','Kaduna',3],
 ['Ogoja','Cross River',3],['Offa','Kwara',3],['Ilesa','Osun',3],['Owo','Ondo',3],['Suleja','Niger',3],['Keffi','Nasarawa',3],
 ['Daura','Katsina',3],['Funtua','Katsina',3],['Gboko','Benue',3],['Otukpo','Benue',3],['Mubi','Adamawa',3],['Biu','Borno',3],['Azare','Bauchi',3],
 ['Ikorodu','Lagos',1],['Epe','Lagos',2],['Ota','Ogun',2],['Sagamu','Ogun',2],['Ughelli','Delta',2],['Auchi','Edo',2],['Orlu','Imo',2],
 ['Okigwe','Imo',2],['Eket','Akwa Ibom',2],['Oron','Akwa Ibom',2],['Ede','Osun',2],['Iseyin','Oyo',3],['Iwo','Osun',3],['Ikare','Ondo',3],
 ['Agbor','Delta',3],['Ekpoma','Edo',3],['Uromi','Edo',3],['Ohafia','Abia',3],['Arochukwu','Abia',3],['Afikpo','Ebonyi',3],['Ikom','Cross River',3],
 ['Brass','Bayelsa',3],['Degema','Rivers',3],['Jebba','Kwara',3],['Idah','Kogi',3],['Kabba','Kogi',3],['Pankshin','Plateau',3],['Shendam','Plateau',3],
 ['Wukari','Taraba',3],['Numan','Adamawa',3],['Bama','Borno',3],['Gashua','Yobe',3],['Nguru','Yobe',3],['Hadejia','Jigawa',3],['Kazaure','Jigawa',3],
 ['Malumfashi','Katsina',3],['Zuru','Kebbi',3],['Yauri','Kebbi',3],['Kaura Namoda','Zamfara',3],['Talata Mafara','Zamfara',3],['Wudil','Kano',3],
 ['Kontagora','Niger',3],['Akwanga','Nasarawa',3],['Udi','Enugu',3],['Ihiala','Anambra',3],['Ilaro','Ogun',3],['Saki','Oyo',3],['Ikere-Ekiti','Ekiti',3],
 ['Okitipupa','Ondo',3],['Ore','Ondo',3]
].map(([name,state,lv])=>({name,state,lv}));
/* Places to visit and festivals: [name, state, level] */
export const PLACES=[
 ['Olumo Rock','Ogun',1],['Yankari Game Reserve','Bauchi',1],['the Osun-Osogbo Sacred Grove','Osun',1],['the Eyo Festival','Lagos',1],
 ['the Calabar Carnival','Cross River',1],['the Third Mainland Bridge','Lagos',1],['Zuma Rock','Niger',2],['the Obudu Mountain Resort','Cross River',2],
 ['the Idanre Hills','Ondo',2],['the Ikogosi Warm Springs','Ekiti',2],['the Argungu Fishing Festival','Kebbi',2],['the Ofala Festival of Onitsha','Anambra',2],
 ['Cocoa House','Oyo',2],['Dala Hill','Kano',2],['the Lekki Conservation Centre','Lagos',2],['the Kainji Dam','Niger',2],
 ['the Sukur Cultural Landscape','Adamawa',3],['the Igue Festival','Edo',3],['Kurmi Market','Kano',3],['Oloibiri, where oil was first found in 1956','Bayelsa',3],
 ['the Erin-Ijesha (Olumirin) Waterfalls','Osun',3],['the Gurara Falls','Niger',3],['the Farin Ruwa Falls','Nasarawa',3],['the Mambilla Plateau','Taraba',3],
 ['Chappal Waddi, the highest point in Nigeria','Taraba',3],['the Agbokim Waterfalls','Cross River',3],['the Ogbunike Caves','Anambra',3],
 ['the Awhum Waterfall','Enugu',3],['the Owu Falls','Kwara',3],['Mount Patti','Kogi',3],['Ibeno Beach','Akwa Ibom',3],['the Jos Wildlife Park','Plateau',2]
].map(([name,state,lv])=>({name,state,lv}));
