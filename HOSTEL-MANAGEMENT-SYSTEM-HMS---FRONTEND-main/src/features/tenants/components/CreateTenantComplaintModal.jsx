import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageSquareWarning, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDialogA11y } from '../../../components/ui/useDialogA11y';
import { useCreateTenantComplaint } from '../hooks/useTenantComplaints';
import { createTenantComplaintSchema } from '../schemas/tenantSchemas';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

export default function CreateTenantComplaintModal({ open, onClose }) {
  const dialogRef = useDialogA11y({ open, onClose });
  const createMutation = useCreateTenantComplaint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTenantComplaintSchema),
    defaultValues: {
      category: '',
      priority: 'MEDIUM',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        category: '',
        priority: 'MEDIUM',
        description: '',
      });
    }
  }, [open, reset]);

  if (!open) return null;

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      reset();
      onClose?.();
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-tenant-complaint-title"
        aria-describedby="create-tenant-complaint-description"
        className="responsive-dialog-panel w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl outline-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h2 id="create-tenant-complaint-title" className="text-base font-semibold text-slate-950">New Complaint</h2>
            <p id="create-tenant-complaint-description" className="mt-0.5 text-xs text-slate-500">Describe the issue for review.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close complaint form"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="p-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-950">Category</span>
              <input
                type="text"
                placeholder="Electrical, Plumbing, Cleaning..."
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                {...register('category')}
              />
              <FieldError message={errors.category?.message} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-950">Priority</span>
              <select
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500"
                {...register('priority')}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <FieldError message={errors.priority?.message} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-950">Description</span>
              <textarea
                rows={5}
                placeholder="Explain the issue clearly..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                {...register('description')}
              />
              <FieldError message={errors.description?.message} />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Raising...
                </>
              ) : (
                <>
                  <MessageSquareWarning className="h-4 w-4" />
                  Raise Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
