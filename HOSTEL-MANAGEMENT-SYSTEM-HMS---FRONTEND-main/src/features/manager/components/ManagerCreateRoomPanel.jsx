import { zodResolver } from '@hookform/resolvers/zod';
import { BedDouble, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  MANAGER_INPUT_CLASS,
  ManagerFormInput,
  ManagerPanel,
} from './ManagerDashboardUi';
import { useCreateManagerRoomWithImage } from '../hooks/useManagerRooms';
import { managerRoomSchema } from '../schemas/managerRoom.schema';

export default function ManagerCreateRoomPanel() {
  const createRoomWithImage = useCreateManagerRoomWithImage();

  const form = useForm({
    resolver: zodResolver(managerRoomSchema),
    defaultValues: {
      roomNumber: '',
      floor: '',
      roomType: '',
      totalBeds: '',
      image: null,
    },
  });

  const onSubmit = async (values) => {
    try {
      const selectedImage =
        values.image instanceof File
          ? values.image
          : values.image?.[0] || null;

      await createRoomWithImage.mutateAsync({
        roomNumber: values.roomNumber,
        floor: values.floor,
        roomType: values.roomType,
        totalBeds: values.totalBeds,
        image: selectedImage,
      });

      form.reset({
        roomNumber: '',
        floor: '',
        roomType: '',
        totalBeds: '',
        image: null,
      });
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <ManagerPanel
      title="Create room"
      subtitle="Add a room to your branch and include an image when available."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ManagerFormInput
            label="Room Number"
            error={form.formState.errors.roomNumber?.message}
          >
            <input
              className={MANAGER_INPUT_CLASS}
              {...form.register('roomNumber')}
            />
          </ManagerFormInput>

          <ManagerFormInput
            label="Floor"
            error={form.formState.errors.floor?.message}
          >
            <input
              type="number"
              className={MANAGER_INPUT_CLASS}
              {...form.register('floor')}
            />
          </ManagerFormInput>

          <ManagerFormInput
            label="Room Type"
            error={form.formState.errors.roomType?.message}
          >
            <input
              className={MANAGER_INPUT_CLASS}
              placeholder="AC / Non AC / Sharing"
              {...form.register('roomType')}
            />
          </ManagerFormInput>

          <ManagerFormInput
            label="Total Beds"
            error={form.formState.errors.totalBeds?.message}
          >
            <input
              type="number"
              className={MANAGER_INPUT_CLASS}
              {...form.register('totalBeds')}
            />
          </ManagerFormInput>
        </div>

        <ManagerFormInput
          label="Room Image"
          error={form.formState.errors.image?.message}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={`${MANAGER_INPUT_CLASS} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-700 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white`}
            {...form.register('image')}
          />
        </ManagerFormInput>

        <button
          type="submit"
          disabled={createRoomWithImage.isPending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {createRoomWithImage.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <BedDouble className="h-4 w-4" />
              Create room
            </>
          )}
        </button>
      </form>
    </ManagerPanel>
  );
}