import React from "react";
import {Botsjef} from "@/app/b%C3%B8ter/sjef/botsjef.tsx";
import {redirect} from "next/navigation";
import {validateRequest} from "@/lib/auth/validateRequest.ts";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }
    if (user.type != "admin") {
        return redirect("/");
    }

    return <Botsjef />
}