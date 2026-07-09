import ClientCard from "../ClientCard";
import EmptyState from "@/components/EmptyState";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  ntn?: string | null;
  isCorporate: boolean;
}

interface ClientListProps {
  clients: Client[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClient: () => void;
}

export default function ClientList({
  clients,
  onEdit,
  onDelete,
  onAddClient,
}: ClientListProps) {
  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients yet"
        description="Add your first client to start creating invoices for them."
        actionLabel="Add Client"
        onAction={onAddClient}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders a reusable list of client cards for the client management section.
// • Displays each client using the shared ClientCard component, ensuring a
//   consistent presentation across the application.
// • Passes edit and delete callbacks to each client card, enabling client
//   management actions from the parent component.
// • Detects when no clients are available and displays a reusable EmptyState
//   component with guidance for the user.
// • Provides an "Add Client" action within the empty state, allowing users to
//   quickly create their first client.
// • Uses a vertically stacked layout with consistent spacing to maintain a
//   clean and organized client listing.
// • Separates list rendering from individual client presentation, promoting
//   component reusability and maintainable application architecture.
// ─────────────────────────────────────────────────────────────────────────────
