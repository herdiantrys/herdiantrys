
import { client } from "./sanity/lib/client";

async function checkPoints() {
    const users = await client.fetch(`*[_type == "user"]{email, points, username}`);
    console.log("Users and Points:", JSON.stringify(users, null, 2));
}

checkPoints();
