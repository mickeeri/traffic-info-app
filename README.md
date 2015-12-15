# 1dv449_laboration3
Laboration 3 Webbteknik II

[Publicerad applikation](http://me222wm.se/1dv449_laboration3/)

## Reflektion

#### Vad finns det för krav du måste anpassa dig efter i de olika API:erna?
På https://www.openstreetmap.org/copyright specificerar OpenStreetMaps att man har rätt att använda deras data så länge man anger  ”OpenStreetMaps och dess bidragsgivare som källa.” Detta gör man genom att ha med en källhänvisning i ena hörnet innehållandes en länk till sidan om upphovsrätt. Det är också så Leaflet (som jag också använder) visar i sina exempel.

Sveriges radio talar om att det inte finns några begräsningar på exempelvis antalet anrop, men att de uppskattar att man gör så få anrop som möjligt. De kräver inte registrering.

#### Hur och hur länge cachar du ditt data för att slippa anropa API:erna i onödan?
Under vissa tider på dygnet inkommer ny trafikinformation varje minut, men jag har beslutat mig för att lagra resultet av ett API-anrop i 10 minuter. 

Hur jag skulle lagra det var ganska knepigt. Först försökte jag få det att cachas, men det fungerade inte. Slutligen beslutade jag mig för att lagra det i local storage. Genom en JavaScript setInterval-funktion uppdateras innehållet. Jag håller även reda på när objektet blev sparat, och har den informationen även om användaren t.ex. laddar om sidan. 

#### Vad finns det för risker kring säkerhet och stabilitet i din applikation?
Enligt Sveriges Radio är deras API bara i beta-stadiet, vilket gör att det kan förändras. Det är en risk eftersom ens applikation utan förvarning kan sluta fungera om de ändrar något. 

Att få kartan via OpenStreetMaps är förmodligen ganska resurskrävande eftersom kartan består av mindre png-filer som måste laddas in så fort man exempelvis zoomar in och ut och är svåra att cacha. 

Jag hade också lite problem med Leaflet. Resurser som laddades in via ett ”Content delivery network” slutade att fungera vilket gjorde att min applikation gick i lås. 

Den enda säkerhetsrisken jag kan komma på är om det på något sätt kommer in skadlig kod via SR:s API. 

#### Hur har du tänkt kring säkerheten i din applikation?
Applikationen har ingen inloggning, inga textfält där en elak användare kan infoga skadlig kod, ingen databas etc. 

Den största risken är att hämta data från en annan källa. Jag använder jQuery-metoden getJSON för att hämta data. [Här](http://stackoverflow.com/questions/29022794/is-getjson-safe-to-call-on-untrusted-url) diskuteras risker med metoden. Om jag har förstått det rätt och man ska lita på detta filterar den skadlig kod, men riskerna ökar om man använder JSONP - vilket jag inte gör.

#### Hur har du tänkt kring optimeringen i din applikation?
Jag har placerat css-filer i head-taggen och js-filer längst ner som sig bör. Jag har även en .htaccess-fil där jag ser till att så mycket som möjligt blir cachat. På webbservern tillåter även det mesta komprimering med gzip enligt response-headerns. Jag sparar även resultatet från API-anropet i några minuter. Förutom det använder jag de minifierade versionerna av exempelvis jQuery, samt att några resurser levereras via ett ”Content delivery network”. 
