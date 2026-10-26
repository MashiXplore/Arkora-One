// src/frontend/components/modules/users/UserEditModal.tsx
// Formulario modal de edición de usuario
// Skill: react-modernization

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema, type UpdateUserInput } from '@/backend/validators/user.validator';
import { useUpdateUser } from '@/frontend/hooks/useUsers';
import { useRoles } from '@/frontend/hooks/useRoles';
import { Button, Input, Select, Modal, showToast } from '@/frontend/components/ui';
import type { UserWithRole } from '@/types/user.types';

export interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithRole | null;
  onSuccess?: () => void;
}

export function UserEditModal({ isOpen, onClose, user, onSuccess }: UserEditModalProps) {
  const updateUserMutation = useUpdateUser();
  const { data: rolesData } = useRoles();

  const roleOptions = rolesData
    ? rolesData.map((r) => ({ value: r.id, label: r.name }))
    : [
        { value: 1, label: 'Administrador' },
        { value: 2, label: 'Técnico' },
        { value: 3, label: 'Supervisor' },
        { value: 4, label: 'Solicitante' },
      ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserInput) => {
    if (!user) return;
    try {
      const result = await updateUserMutation.mutateAsync({ id: user.id, data });
      if (result.success) {
        showToast.success('Usuario actualizado correctamente');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast.error(result.error?.message ?? 'Error al actualizar usuario');
      }
    } catch {
      showToast.error('Error de conexión al actualizar usuario');
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
      size="md"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting || updateUserMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            id="btn-update-user"
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting || updateUserMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col gap-4">
        <Input
          id="edit-name"
          label="Nombre Completo"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="edit-username"
          label="Nombre de Usuario"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          id="edit-email"
          label="Correo Electrónico"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="edit-password"
          label="Nueva Contraseña (Opcional)"
          type="password"
          helperText="Dejar en blanco para mantener la actual"
          error={errors.password?.message}
          {...register('password')}
        />
        <Select
          id="edit-role"
          label="Rol del Usuario"
          error={errors.roleId?.message}
          options={roleOptions}
          {...register('roleId', { valueAsNumber: true })}
        />
        <Select
          id="edit-status"
          label="Estado de la Cuenta"
          options={[
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' },
          ]}
          {...register('isActive', { setValueAs: (val) => val === 'true' || val === true })}
        />
      </form>
    </Modal>
  );
}
