// src/frontend/components/modules/users/UserCreateModal.tsx
// Formulario modal de creación de usuario
// Skill: react-modernization

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserInput } from '@/backend/validators/user.validator';
import { useCreateUser } from '@/frontend/hooks/useUsers';
import { useRoles } from '@/frontend/hooks/useRoles';
import { Button, Input, Select, Modal, showToast } from '@/frontend/components/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UserCreateModal({ isOpen, onClose }: Props) {
  const createUser = useCreateUser();
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
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserInput) => {
    try {
      const result = await createUser.mutateAsync(data);
      if (result.success) {
        showToast.success('Usuario creado correctamente');
        reset();
        onClose();
      } else {
        showToast.error(result.error?.message ?? 'Error al crear el usuario');
      }
    } catch {
      showToast.error('Error al intentar crear el usuario');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Usuario"
      size="md"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={isSubmitting || createUser.isPending}
          >
            Cancelar
          </Button>
          <Button
            id="btn-save-user"
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting || createUser.isPending}
          >
            Guardar Usuario
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col gap-4">
        <Input
          id="create-name"
          label="Nombre Completo"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="create-username"
          label="Nombre de Usuario"
          required
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          id="create-email"
          label="Correo Electrónico"
          type="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="create-password"
          label="Contraseña"
          type="password"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <Select
          id="create-role"
          label="Rol del Usuario"
          required
          placeholder="Selecciona un rol"
          options={roleOptions}
          error={errors.roleId?.message}
          {...register('roleId', { valueAsNumber: true })}
        />
      </form>
    </Modal>
  );
}
