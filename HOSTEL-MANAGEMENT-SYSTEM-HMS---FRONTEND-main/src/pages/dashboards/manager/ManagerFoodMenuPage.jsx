import { zodResolver } from '@hookform/resolvers/zod';
import { ChefHat, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import {
  MANAGER_INPUT_CLASS,
  ManagerEmptyBlock,
  ManagerFormInput,
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
  ManagerRefreshButton,
} from '../../../features/manager/components/ManagerDashboardUi';
import {
  ManagerErrorState,
  ManagerLoadingGrid,
} from '../../../features/manager/components/ManagerPhase5States';
import {
  useDeleteManagerFoodMenu,
  useManagerCurrentFoodMenu,
  useManagerFoodMenuHistory,
  useUploadManagerFoodMenu,
} from '../../../features/manager/hooks/useManagerFoodMenu';
import { managerFoodMenuUploadSchema } from '../../../features/manager/schemas/managerFoodMenu.schema';

export default function ManagerFoodMenuPage() {
  const currentQuery = useManagerCurrentFoodMenu();
  const historyQuery = useManagerFoodMenuHistory();
  const uploadMutation = useUploadManagerFoodMenu();
  const deleteMutation = useDeleteManagerFoodMenu();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleRefresh = () => {
    currentQuery.refetch();
    historyQuery.refetch();
  };

  const menus = historyQuery.data || [];
  const isLoading = currentQuery.isLoading || historyQuery.isLoading;
  const isFetching = currentQuery.isFetching || historyQuery.isFetching;

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Food Menu"
        eyebrow="Weekly Schedule"
        description="Upload the weekly menu file and manage previously uploaded menu files."
        actions={<ManagerRefreshButton isFetching={isFetching && !isLoading} onRefresh={handleRefresh} />}
      />

      {currentQuery.isError || historyQuery.isError ? (
        <ManagerErrorState
          title="Food menu could not be loaded"
          message={currentQuery.error?.message || historyQuery.error?.message}
          onRetry={handleRefresh}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ManagerMetricCard title="Current Menu" value={currentQuery.data?.id || currentQuery.data?.fileUrl ? 'Ready' : 'Not available'} icon={ChefHat} tone="green" loading={currentQuery.isLoading} />
        <ManagerMetricCard title="History" value={menus.length} icon={FileText} tone="blue" loading={historyQuery.isLoading} />
        <ManagerMetricCard title="Upload" value="File" subtitle="PDF or image" icon={Upload} tone="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <FoodMenuUploadPanel mutation={uploadMutation} />

        <ManagerPanel title="Current menu" subtitle="Latest menu for this manager.">
          {currentQuery.isLoading ? (
            <ManagerLoadingGrid count={1} />
          ) : currentQuery.data?.fileUrl ? (
            <MenuCard menu={currentQuery.data} />
          ) : (
            <ManagerEmptyBlock title="No current menu" message="Upload a menu file to make it visible for users." />
          )}
        </ManagerPanel>
      </div>

      <ManagerPanel title="Menu history" subtitle="Delete old menu files when they are no longer needed.">
        {historyQuery.isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : menus.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {menus.map((menu) => (
              <MenuCard
                key={menu.id || menu.fileUrl}
                menu={menu}
                onDelete={() => setDeleteConfirm({
                  record: menu,
                  title: 'Delete food menu?',
                  message: 'This file may no longer be visible to tenants. Confirm before deletion.',
                  details: [
                    ['Week', menu.weekStartDate || 'Not available'],
                    ['Menu file', menu.fileUrl ? 'Available' : 'Not available'],
                  ],
                })}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === menu.id}
              />
            ))}
          </div>
        ) : (
          <ManagerEmptyBlock title="No menu history" message="Uploaded menu files will appear here." />
        )}
      </ManagerPanel>

      <OwnerConfirmModal
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        details={deleteConfirm?.details}
        confirmLabel="Delete menu"
        tone="danger"
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          const menu = deleteConfirm?.record;
          if (!menu?.id) return;
          try {
            await deleteMutation.mutateAsync(menu.id);
            setDeleteConfirm(null);
          } catch {
            // toast handled by mutation hook
          }
        }}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function FoodMenuUploadPanel({ mutation }) {
  const form = useForm({
    resolver: zodResolver(managerFoodMenuUploadSchema),
    defaultValues: { weekStartDate: '', file: null },
  });

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values);
      form.reset({ weekStartDate: '', file: null });
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <ManagerPanel title="Upload weekly menu" subtitle="Choose the week start date and select a PDF or image menu.">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <ManagerFormInput label="Week Start Date" error={form.formState.errors.weekStartDate?.message}>
          <input type="date" className={`${MANAGER_INPUT_CLASS} cursor-pointer`} {...form.register('weekStartDate')} />
        </ManagerFormInput>
        <ManagerFormInput label="Menu File" error={form.formState.errors.file?.message}>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className={`${MANAGER_INPUT_CLASS} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-700 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white`}
            {...form.register('file')}
          />
        </ManagerFormInput>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          {mutation.isPending ? 'Uploading...' : 'Upload Menu'}
        </button>
      </form>
    </ManagerPanel>
  );
}

function MenuCard({ menu, onDelete, isDeleting = false }) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-slate-950">Week of {menu.weekStartDate || 'Not available'}</p>
          <p className="mt-1 text-[12px] text-slate-500">{menu.fileUrl ? 'Menu file available' : 'Menu file not available'}</p>
        </div>
        <ChefHat className="h-5 w-5 shrink-0 text-sky-700" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {menu.fileUrl ? (
          <a
            href={menu.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[10px] border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Open File
          </a>
        ) : null}
        {onDelete && menu.id ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-3 text-[12px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        ) : null}
      </div>
    </article>
  );
}
