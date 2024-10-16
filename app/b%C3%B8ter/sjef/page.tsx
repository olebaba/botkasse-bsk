import React from "react";
import {Botsjef} from "@/app/b%C3%B8ter/sjef/botsjef.tsx";
import {validateRequest} from "@/app/lib/auth.ts";
import {redirect} from "next/navigation";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }

    return <Botsjef />
}