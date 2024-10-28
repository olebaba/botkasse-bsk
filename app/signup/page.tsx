import {signup} from "@/app/lib/auth.ts";
import Link from "next/link";
import SignupForm from "@/app/signup/signup-form.tsx";

export default async function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Registrer ny bruker</h1>
                <SignupForm signupAction={signup}/>
                <div className="text-blue-600 mt-8" >
                    <Link href={"/login"}>Vil du logge inn? Trykk her</Link>
                </div>
            </div>
        </div>
    );
}

