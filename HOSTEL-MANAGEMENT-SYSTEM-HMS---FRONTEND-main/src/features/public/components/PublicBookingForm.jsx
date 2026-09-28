import { zodResolver } from "@hookform/resolvers/zod";
import { BedDouble, Building2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { getAccessToken, getStoredUser } from "../../../lib/axios/apiClient";
import useAuthStore from "../../../store/authStore";
import { normalizeRole, ROLES } from "../../../utils/constants/roles";
import { usePublicBooking } from "../hooks/usePublicBooking";
import { publicBookingSchema } from "../schemas/publicBooking.schema";
import PublicBookingConfirmation from "./PublicBookingConfirmation";

export default function PublicBookingForm({
  branchId = "",
  roomId = "",
  bedId = "",
  branchName = "",
  bedLabel = "",
  title = "Request booking",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingMutation = usePublicBooking();
  const [roleError, setRoleError] = useState("");
  const authUser = useAuthStore((state) => state.user);
  const authRole = useAuthStore((state) => state.role);
  const storedUser = useMemo(() => getStoredUser(), []);
  const form = useForm({
    resolver: zodResolver(publicBookingSchema),
    values: {
      branchId,
      roomId,
      bedId,
    },
  });

  const currentRole = normalizeRole(
    authRole || authUser?.role || storedUser?.role,
  );

  const onSubmit = async (values) => {
    setRoleError("");

    if (!getAccessToken()) {
      navigate("/register", {
        replace: false,
        state: {
          bookingContext: {
            branchId: values.branchId,
            roomId: values.roomId,
            bedId: values.bedId,
          },
          previousPublicPath: {
            pathname: location.pathname,
            search: location.search,
          },
          message: "Register first to request a bed booking.",
        },
      });
      return;
    }

    if (currentRole && currentRole !== ROLES.PUBLIC_USER) {
      setRoleError(
        "Please use a guest account to request a booking for this hostel.",
      );
      return;
    }

    await bookingMutation.mutateAsync(values);
  };

  const hasSelection = Boolean(branchId && bedId);

  return (
    <section className="rounded-[22px] border border-[#E8E2D6] bg-white p-5 shadow-[0_12px_30px_rgba(44,31,14,0.08)]">
      <h2 className="font-display text-[26px] font-bold text-[#2C1F0E]">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[#5C5248]">
        Choose an available bed and send a request. The hostel team will review it and share the next step.
      </p>

      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <label className="block">
          <span className="text-sm font-bold text-[#2C1F0E]">Hostel</span>
          <div className="mt-2 flex min-h-11 items-center gap-3 rounded-[13px] border border-[#E8E2D6] bg-[#FDFAF5] px-3">
            <Building2 className="h-4 w-4 shrink-0 text-[#3B5E2B]" />
            <input
              readOnly
              className="w-full bg-transparent text-sm text-[#2C1F0E] outline-none"
              value={branchName || branchId || ""}
              aria-label="Selected branch"
            />
          </div>
          <input type="hidden" {...form.register("branchId")} />
          {form.formState.errors.branchId ? (
            <p className="mt-1 text-xs font-semibold text-[#B5532A]">
              {form.formState.errors.branchId.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#2C1F0E]">Bed</span>
          <div className="mt-2 flex min-h-11 items-center gap-3 rounded-[13px] border border-[#E8E2D6] bg-[#FDFAF5] px-3">
            <BedDouble className="h-4 w-4 shrink-0 text-[#3B5E2B]" />
            <input
              readOnly
              className="w-full bg-transparent text-sm text-[#2C1F0E] outline-none"
              value={bedLabel || bedId || ""}
              aria-label="Selected bed"
            />
          </div>
          <input type="hidden" {...form.register("bedId")} />
          <input type="hidden" {...form.register("roomId")} />
          {form.formState.errors.bedId ? (
            <p className="mt-1 text-xs font-semibold text-[#B5532A]">
              {form.formState.errors.bedId.message}
            </p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={bookingMutation.isPending || !hasSelection}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-[#3B5E2B] px-4 text-sm font-bold text-white transition hover:bg-[#2A4420] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bookingMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit booking request"
          )}
        </button>
      </form>

      {!hasSelection ? (
        <p className="mt-4 rounded-[13px] bg-[#FAF2DC] px-3 py-2 text-sm font-semibold text-[#5C5248]">
          Select an available bed to enable booking.
        </p>
      ) : null}

      {roleError ? (
        <p className="mt-4 rounded-[13px] bg-[#FAF2DC] px-3 py-2 text-sm font-semibold text-[#5C5248]">
          {roleError}
        </p>
      ) : null}

      {bookingMutation.isError ? (
        <p className="mt-4 rounded-[13px] bg-[#F5E0D5] px-3 py-2 text-sm font-semibold text-[#B5532A]">
          Booking request could not be submitted. Please try again.
        </p>
      ) : null}

      {bookingMutation.data ? (
        <div className="mt-5">
          <PublicBookingConfirmation booking={bookingMutation.data} />
        </div>
      ) : null}
    </section>
  );
}
