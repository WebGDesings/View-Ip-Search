const prompt = require('prompt-sync')();
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const API_KEY = "98bc4ff233e640bf9498f95b1cfea26b";

console.clear();

const title = figlet.textSync("Search IP", { horizontalLayout: 'default' });
const boxedTitle = boxen(title, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
});
console.log(chalk.greenBright(boxedTitle));

function isPrivateIP(ip) {
    const blocks = ip.split('.').map(Number);
    return (
        (blocks[0] === 10) ||
        (blocks[0] === 172 && blocks[1] >= 16 && blocks[1] <= 31) ||
        (blocks[0] === 192 && blocks[1] === 168)
    );
}

async function mainMenu() {
    while (true) {
        console.log(chalk.yellow("\n📌 Opciones disponibles:"));
        console.log(chalk.cyan(" 1. Buscar por IP"));
        console.log(chalk.cyan(" 2. Buscar por Número Telefónico"));
        console.log(chalk.cyan(" 3. OSINT (Búsqueda básica - Duckduckgo)"));
        console.log(chalk.cyan(" 4. Salir"));

        const choice = prompt(chalk.yellow("➡️  Seleccione una opción (1-4): ")).trim();

        if (choice === '1') {
            const ip = prompt(chalk.blue("🔍 Ingrese la dirección IP: ")).trim();
            if (!ip) {
                console.log(chalk.red("⚠️  IP no válida."));
                continue;
            }

            const fecha = new Date().toLocaleString();
            console.log(chalk.gray(`🕒 Fecha y hora de consulta: ${fecha}`));

            try {
                const res = await fetch(`https://api.ipquery.io/${ip}?format=json`);
                const data = await res.json();

                console.log(chalk.gray("\n" + "─".repeat(50)));
                console.log(chalk.magentaBright("🌐 Información de la IP:\n"));

                console.log(chalk.white("IP:             ") + chalk.green(data.ip));
                console.log(chalk.white("ISP:            ") + chalk.green(data.isp.isp || "N/A"));
                console.log(chalk.white("ASN:            ") + chalk.gray(data.isp.asn || "N/A"));
                console.log(chalk.white("Organización:   ") + chalk.gray(data.isp.org || "N/A"));

                console.log(chalk.white("País:           ") + chalk.cyan(data.location.country));
                console.log(chalk.white("Código País:    ") + chalk.cyan(data.location.country_code));
                console.log(chalk.white("Ciudad:         ") + chalk.yellow(data.location.city || "Desconocida"));
                console.log(chalk.white("Estado/Región:  ") + chalk.yellow(data.location.state || "Desconocida"));
                console.log(chalk.white("Código Postal:  ") + chalk.yellow(data.location.zipcode || "N/A"));
                console.log(chalk.white("Latitud:        ") + chalk.green(data.location.latitude));
                console.log(chalk.white("Longitud:       ") + chalk.green(data.location.longitude));
                console.log(chalk.white("Zona Horaria:   ") + chalk.magenta(data.location.timezone));
                console.log(chalk.white("Hora Local:     ") + chalk.magenta(data.location.localtime));
                console.log(chalk.white("Mapa:           ") + chalk.underline.blueBright(`https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}`));
                console.log(chalk.white("Tipo de IP:     ") + chalk.bold(isPrivateIP(ip) ? "Privada" : "Pública"));

                console.log(chalk.white("\n🔐 Información de riesgo:"));
                console.log(chalk.white("¿Móvil?:        ") + chalk.gray(data.risk.is_mobile ? "Sí" : "No"));
                console.log(chalk.white("¿VPN?:          ") + chalk.gray(data.risk.is_vpn ? "Sí" : "No"));
                console.log(chalk.white("¿TOR?:          ") + chalk.gray(data.risk.is_tor ? "Sí" : "No"));
                console.log(chalk.white("¿Proxy?:        ") + chalk.gray(data.risk.is_proxy ? "Sí" : "No"));
                console.log(chalk.white("¿Datacenter?:   ") + chalk.gray(data.risk.is_datacenter ? "Sí" : "No"));
                console.log(chalk.white("Puntaje riesgo: ") + chalk.gray(data.risk.risk_score));

                console.log(chalk.gray("─".repeat(50)));
            } catch (err) {
                console.log(chalk.red("❌ Error al consultar la IP."));
                console.error(chalk.gray(err.message));
            }

        } else if (choice === '2') {
            const phoneip = prompt(chalk.magenta("📞 Ingrese el número telefónico (ej. 14152007986): ")).trim();
            if (!phoneip || isNaN(phoneip)) {
                console.log(chalk.red("⚠️  Número inválido."));
                continue;
            }

            try {
                const res = await fetch(`https://phonevalidation.abstractapi.com/v1/?api_key=${API_KEY}&phone=${phoneip}`);
                const data = await res.json();

                console.log(chalk.gray("\n" + "─".repeat(50)));
                console.log(chalk.magentaBright("📱 Información del número:\n"));
                console.log(chalk.white("Número:           ") + chalk.green(data.phone));
                console.log(chalk.white("Válido:           ") + chalk.bold(data.valid ? "✅ Sí" : "❌ No"));
                console.log(chalk.white("Formato Internacional: ") + chalk.yellow(data.format?.international || "N/A"));
                console.log(chalk.white("Formato Local:    ") + chalk.yellow(data.format?.local || "N/A"));
                console.log(chalk.white("País:             ") + chalk.cyan(data.country?.name || "Desconocido"));
                console.log(chalk.white("Código País:      ") + chalk.cyan(data.country?.code || "N/A"));
                console.log(chalk.white("Nombre:          ") + chalk.cyan(data.country?.name || "N/A"));
                console.log(chalk.white("Prefijo:          ") + chalk.cyan(data.country?.prefix || "N/A"));
                console.log(chalk.white("Ubicación:        ") + chalk.yellow(data.location));
                console.log(chalk.white("Tipo de línea:    ") + chalk.gray(data.type));
                console.log(chalk.white("Compañía:         ") + chalk.green(data.carrier));
                console.log(chalk.gray("─".repeat(50)));
            } catch (err) {
                console.log(chalk.red("❌ Error al consultar el número telefónico."));
                console.error(chalk.gray(err.message));
            }
        } else if ( choice === '3' ){
            const query = prompt("🔎 Ingrese el nombre, email, dominio o palabra clave a buscar: ").trim();
            if (!query) {
                console.log("⚠️  Entrada inválida.");
                continue;
            }

            const encoded = encodeURIComponent(query);
            const searchURL = `https://duckduckgo.com/?t=h_&q=${encoded}&ia=web`;

            console.log("\n🌐 Abriendo búsqueda OSINT en el navegador...");

            const platform = process.platform;
            let command;

            if (platform === 'win32') {
                command = `start "" "${searchURL}"`;
            } else if (platform === 'darwin') {
                command = `open "${searchURL}"`;
            } else if (platform === 'android') {
                // Termux Android
                command = `termux-open-url "${searchURL}"`;
            } else {
                // Linux u otros
                command = `xdg-open "${searchURL}"`;
            }

            exec(command, (error) => {
                if (error) {
                    console.log(chalk.red("❌ Error al abrir el navegador."));
                    console.error(chalk.gray(error.message));
                }
            });
        }  else if (choice === '4') {
            console.log(chalk.greenBright("\n👋 Saliendo del programa. ¡Hasta luego!"));
            break;
        } else {
        	console.clear();
        	setTimeout(()=>{
              	console.log(chalk.red("❌ Opción no válida. Intente de nuevo."));
        	}, 3000);
        }
    }
}

mainMenu();