import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LeadershipMemberRow } from '@/lib/api';
import { reorderLeadershipMembers } from '@/lib/api';
import { resolveLeadershipMemberImage } from '@/lib/leadershipLocalPhotos';

function SortableMemberRow({
  member,
  sectionKey,
  apiKey,
  onEdit,
  onDelete,
  disabled,
}: {
  member: LeadershipMemberRow;
  sectionKey: string;
  apiKey: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const thumb = resolveLeadershipMemberImage(sectionKey, member.name, member.image, apiKey);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 flex flex-wrap gap-3 items-center hover:bg-muted/20 border-b border-border/40 last:border-b-0 bg-background/50"
    >
      <button
        type="button"
        className="touch-none p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 disabled:opacity-40"
        disabled={disabled}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      {thumb ? (
        <img src={thumb} alt={member.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">—</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{member.name}</p>
        <p className="text-xs text-muted-foreground">
          {member.role_title || 'No role'}
          {' · '}
          {member.is_active ? 'Active' : 'Hidden'}
          {' · '}
          order {member.sort_order}
        </p>
      </div>
      <Button size="sm" variant="outline" type="button" onClick={onEdit} disabled={disabled}>
        <Pencil className="w-4 h-4 mr-1" /> Edit
      </Button>
      <Button size="sm" variant="destructive" type="button" onClick={onDelete} disabled={disabled}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function LeadershipSectionMemberList({
  sectionKey,
  sectionTitle,
  members,
  year,
  apiKey,
  disabled,
  onEdit,
  onDelete,
  onReorderDone,
}: {
  sectionKey: string;
  sectionTitle: string;
  members: LeadershipMemberRow[];
  year: number;
  apiKey: string;
  disabled: boolean;
  onEdit: (m: LeadershipMemberRow) => void;
  onDelete: (m: LeadershipMemberRow) => void;
  onReorderDone: () => void;
}) {
  const [items, setItems] = useState(members);
  useEffect(() => {
    setItems(members);
  }, [members]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reorderMut = useMutation({
    mutationFn: (ids: number[]) => reorderLeadershipMembers(apiKey, { section_key: sectionKey, year, ids }),
    onSuccess: () => onReorderDone(),
  });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderMut.mutate(next.map((m) => m.id));
  };

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground px-4 py-6 text-center border-t border-border/60">No members in this section for {year}.</p>;
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground px-4 py-2 bg-muted/30 border-b border-border/60">
        Drag the handle to change display order in {sectionTitle}.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          {items.map((m) => (
            <SortableMemberRow
              key={m.id}
              member={m}
              sectionKey={sectionKey}
              apiKey={apiKey}
              disabled={disabled || reorderMut.isPending}
              onEdit={() => onEdit(m)}
              onDelete={() => onDelete(m)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {reorderMut.isError && (
        <p className="text-xs text-destructive px-4 py-2">{reorderMut.error instanceof Error ? reorderMut.error.message : 'Reorder failed'}</p>
      )}
    </div>
  );
}
