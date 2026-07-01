"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/schemas/login";
import { PasswordInput } from "@/components/ui/password-input";


interface CredentialsFormProps {
  onSubmit: (data: LoginInput) => void;
  isLoading: boolean;
  onEmailBlur: (email: string) => void; // 🌟 Tambahkan baris interface ini
}

export function CredentialsForm({ onSubmit, isLoading, onEmailBlur }: CredentialsFormProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      {/* Field: Email Utama */}
      <div className="space-y-1.5 flex flex-col w-full">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {"Email Terdaftar"}
        </label>
        <input
          {...register("email")}
          type="email"
          disabled={isLoading}
          onBlur={(e) => onEmailBlur(e.target.value)}
          placeholder={"Masukkan alamat email"}
          className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0b111e]/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-blue-500 dark:focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/5 transition-all disabled:opacity-50"
        />
        {errors.email && (
          <p className="text-[11px] text-red-500 dark:text-red-400 font-medium mt-0.5">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Field: Password */}
      <PasswordInput
        label={"Kata Sandi"}
        register={register("password")}
        disabled={isLoading}
        error={errors.password?.message}
        placeholder="••••••••"
      />

      {/* Tombol Akses Masuk Utama */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 h-10 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-600/40 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 transition duration-150 active:scale-[0.99] cursor-pointer"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{"Memeriksa Kredensial..."}</span>
          </div>
        ) : (
          "loginPortal"
        )}
      </button>
    </form>
  );
}