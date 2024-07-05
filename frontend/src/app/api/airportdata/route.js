import {  NextResponse } from "next/server";
import { promises as fs } from 'fs';

export async function GET(NextRequest) {
    const airportData = []
    const file = await fs.readFile(process.cwd() + '/src/components/Form/airport-dump-json.json', 'utf8');
    const data = JSON.parse(file);


    for (let i = 0; i < data.airport.length; i++) {
        const { name, iata_code, city_name } = data.airport[i];
        const airportDetails = { name, iata_code, city_name };
        airportData.push(airportDetails);
    }

    return NextResponse.json(airportData);
}