import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useDialogA11y } from '../../../components/ui/useDialogA11y';
import { useUpdateStaff } from '../hooks/useUpdateStaff';
import { managerUpdateStaffSchema } from '../schemas/managerUser.schema';

const INPUT_CLASS =
  'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100';

export default function ManagerEditStaffPanel({ staff, onClose }) {
  const dialogRef = useDialogA11y({ open: Boolean(staff), onClose });
  const mutation = useUpdateStaff();
  const form = useForm({
    resolver: zodResolver(managerUpdateStaffSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (staff) {
      form.reset({
        name: staff.name === '-' ? '' : staff.name || '',
        phone: staff.phone === '-' ? '' : staff.phone || '',
      });
    }
  }, [form, staff]);

  if (!staff) return null;

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync({ id: staff.id, values });
      onClose?.();
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:justify-center sm:p-4">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-staff-title"
        aria-describedby="edit-staff-description"
        className="responsive-dialog-panel max-h-[92vh] w-full overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl outline-none sm:max-w-lg sm:rounded-xl"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h2 id="edit-staff-title" className="text-lg font-semibold text-slate-950">Edit staff</h2>
            <p id="edit-staff-description" className="mt-0.5 text-xs text-slate-500">Update staff contact details</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit staff panel"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="grid gap-4 p-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Field label="Name" error={form.formState.errors.name?.message}>
            <input className={INPUT_CLASS} {...form.register('name')} />
          </Field>
          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <input className={INPUT_CLASS} {...form.register('phone')} />
          </Field>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}
