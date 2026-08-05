'use client';

import { useState } from 'react';
import type { VacanteListItem } from '@/lib/data/vacantes';
import PostulacionModal from '@/components/PostulacionModal';

export function PostularButton({
  vacante,
  className,
  children = 'Postular',
}: {
  vacante: VacanteListItem;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <PostulacionModal vacante={vacante} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
