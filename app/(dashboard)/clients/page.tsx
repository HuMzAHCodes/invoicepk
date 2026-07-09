"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/Clients/SearchBar";
import ClientList from "@/components/Clients/ClientList";
import ClientForm from "@/components/Clients/ClientForm";
import DeleteConfirmDialog from "@/components/Clients/DeleteConfirmDialog";
import Modal from "@/components/Clients/Modal";
import { useToast } from "@/components/Toast";
import theme from "@/styles/theme";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  ntn?: string | null;
  isCorporate: boolean;
}

interface ClientsResponse {
  clients: Client[];
  total: number;
}

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const query = params.toString();
      const data = await apiGet<ClientsResponse>(
        `/clients${query ? `?${query}` : ""}`,
      );
      setClients(data.clients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  function handleSearch(query: string) {
    setSearch(query);
  }

  function handleAddClient() {
    setEditingClient(null);
    setShowForm(true);
  }

  function handleEditClient(id: string) {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setEditingClient(client);
      setShowForm(true);
    }
  }

  function handleDeleteClient(id: string) {
    const client = clients.find((c) => c.id === id);
    if (client) setDeletingClient(client);
  }

  async function handleFormSubmit(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    ntn?: string;
    isCorporate: boolean;
  }) {
    try {
      setIsSubmitting(true);
      if (editingClient) {
        await apiPut(`/clients/${editingClient.id}`, data);
        showToast("Client updated successfully");
      } else {
        await apiPost("/clients", data);
        showToast("Client created successfully");
      }
      setShowForm(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingClient) return;
    try {
      setIsDeleting(true);
      await apiDelete(`/clients/${deletingClient.id}`);
      showToast("Client deleted successfully");
      setDeletingClient(null);
      fetchClients();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete client",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const skeletonStyle: React.CSSProperties = {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.lg,
    height: "100px",
    animation: "pulse 1.5s ease-in-out infinite",
  };

  const responsiveCSS = `
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @media (max-width: 768px) { .clients-header { flex-direction: column; align-items: flex-start !important; gap: 12px; } }
  `;

  return (
    <>
      <style>{responsiveCSS}</style>
      <div>
        <div
          className="clients-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing[6],
          }}
        >
          <PageHeader
            title="Clients"
            description="Manage your client directory"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[4],
            }}
          >
            <SearchBar onSearch={handleSearch} />
            <button
              type="button"
              onClick={handleAddClient}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
                backgroundColor: theme.colors.primary[600],
                color: theme.colors.white,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes.sm,
                fontWeight: theme.fontWeights.semibold,
                borderRadius: theme.radius.md,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.colors.primary[400];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.colors.primary[600];
              }}
            >
              + Add Client
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: theme.spacing[4],
              backgroundColor: theme.colors.danger[50],
              color: theme.colors.danger[600],
              borderRadius: theme.radius.md,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              marginBottom: theme.spacing[6],
            }}
          >
            {error}
            <button
              type="button"
              onClick={fetchClients}
              style={{
                marginLeft: "12px",
                padding: "4px 12px",
                backgroundColor: theme.colors.white,
                color: theme.colors.danger[600],
                border: `1px solid ${theme.colors.danger[600]}`,
                borderRadius: theme.radius.md,
                cursor: "pointer",
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes.sm,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} style={skeletonStyle} />
            ))}
          </div>
        ) : (
          <ClientList
            clients={clients}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onAddClient={handleAddClient}
          />
        )}

        <Modal
          isOpen={showForm}
          title={editingClient ? "Edit Client" : "Add Client"}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        >
          <ClientForm
            initialData={editingClient ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingClient(null);
            }}
            isSubmitting={isSubmitting}
          />
        </Modal>

        <DeleteConfirmDialog
          isOpen={!!deletingClient}
          clientName={deletingClient?.name ?? ""}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingClient(null)}
          isDeleting={isDeleting}
        />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Serves as the main Clients management page, orchestrating client retrieval,
//   searching, creation, editing, and deletion workflows.
// • Fetches client records from the backend API with optional search filtering
//   and maintains loading, success, and error states.
// • Supports debounced client searching through the reusable SearchBar
//   component for efficient filtering.
// • Displays clients using the reusable ClientList component and provides an
//   empty state when no clients are available.
// • Enables adding and editing clients through a reusable modal containing the
//   validated ClientForm component.
// • Handles client deletion using a confirmation dialog to prevent accidental
//   removal of records.
// • Integrates the global toast notification system to provide immediate
//   success and error feedback for all CRUD operations.
// • Implements loading skeletons and retry functionality to improve user
//   experience during API requests and error recovery.
// • Manages modal visibility, selected client state, submission status, and
//   deletion state to coordinate user interactions.
// • Uses reusable UI components and the centralized theme configuration to
//   maintain consistent styling, layout, responsiveness, and user experience
//   throughout the client management module.
// ─────────────────────────────────────────────────────────────────────────────
