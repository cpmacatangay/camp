import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Search, Download, Plus, LogOut, KeyRound } from "lucide-react";
import {
  getParticipants,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  deleteParticipants,
  setAttendance,
  exportExcel,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import useDebouncedValue from "../hooks/useDebouncedValue";
import SkeletonRow from "../components/SkeletonRow";
import EmptyState from "../components/EmptyState";
import ParticipantModal from "../components/ParticipantModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Dashboard() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [paymentFilter, setPaymentFilter] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [flashedId, setFlashedId] = useState(null);
  const [presentCount, setPresentCount] = useState(0);
  const [_absentCount, setAbsentCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const hasConnectedBefore = useRef(false);

  useEffect(() => { document.title = "TRAILBLAZE - Admin"; }, []);

  // Refs for socket handler to read latest state without stale closures
  const attendanceFilterRef = useRef(attendanceFilter);
  const participantsRef = useRef(participants);
  useEffect(() => { attendanceFilterRef.current = attendanceFilter; }, [attendanceFilter]);
  useEffect(() => { participantsRef.current = participants; }, [participants]);

  const fetchParticipants = useCallback(async () => {
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (attendanceFilter) params.attendanceStatus = attendanceFilter;
      const data = await getParticipants(params);
      setParticipants(data.participants);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.presentCount !== undefined) {
        setPresentCount(data.presentCount);
        setAbsentCount(data.absentCount);
        setTotalParticipants(data.totalParticipants);
      }
    } catch {
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, paymentFilter, attendanceFilter, page, toast]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, paymentFilter, attendanceFilter]);

  useEffect(() => {
    if (!user?.token) return;
    const socket = io(import.meta.env.VITE_API_URL || "/", {
      auth: { token: user.token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (hasConnectedBefore.current) fetchParticipants();
      hasConnectedBefore.current = true;
      setSocketStatus("connected");
    });

    socket.on("disconnect", () => {
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setSocketStatus("disconnected");
    });

    socket.on("attendance:updated", (data) => {
      const currentFilter = attendanceFilterRef.current;
      const exists = participantsRef.current.some(
        (p) => p._id === data.participantId,
      );

      if (!exists && (!currentFilter || currentFilter === data.attendanceStatus)) {
        // Participant is not on the current page but should be visible — re-fetch
        fetchParticipants();
      } else if (exists) {
        // Update or remove locally
        setParticipants((prev) => {
          if (currentFilter && currentFilter !== data.attendanceStatus) {
            return prev.filter((p) => p._id !== data.participantId);
          }
          return prev.map((p) =>
            p._id === data.participantId
              ? { ...p, attendanceStatus: data.attendanceStatus }
              : p,
          );
        });
      }

      // Flash highlight
      setFlashedId(data.participantId);
      setTimeout(() => setFlashedId(null), 2000);

      // Live counter
      if (data.presentCount !== undefined) {
        setPresentCount(data.presentCount);
      }

      // Toast for scan events
      if (data.source === "scan") {
        toast.success(`${data.name} checked in`);
      }
    });

    return () => socket.close();
  }, [user.token, fetchParticipants, toast]);

  function handleChangePassword() {
    navigate('/change-password');
  }

  function handleLogout() {
    logout();
  }

  async function handleExport() {
    try {
      const blob = await exportExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `participants-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    }
  }

  async function handleAdd(formData) {
    await addParticipant(formData);
    fetchParticipants();
  }

  async function handleEdit(formData, id) {
    await updateParticipant(id, formData);
    fetchParticipants();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteParticipant(deleting._id);
      setDeleting(null);
      fetchParticipants();
      toast.success("Participant deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === participants.length
        ? new Set()
        : new Set(participants.map((p) => p._id)),
    );
  }

  async function handleBulkDelete() {
    try {
      setBulkDeleting(true);
      await deleteParticipants(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeleting(false);
      fetchParticipants();
      toast.success(
        `Deleted ${selectedIds.size} participant${selectedIds.size === 1 ? "" : "s"}`,
      );
    } catch {
      setBulkDeleting(false);
      toast.error("Bulk delete failed");
    }
  }

  async function handleAttendanceToggle(p) {
    const newStatus = p.attendanceStatus === "Present" ? "Absent" : "Present";
    try {
      await setAttendance(p._id, newStatus);
      setParticipants((prev) =>
        prev.map((x) =>
          x._id === p._id ? { ...x, attendanceStatus: newStatus } : x,
        ),
      );
    } catch {
      toast.error("Could not update attendance");
    }
  }

  const filterClass =
    "border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-800">TRAILBLAZE</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  socketStatus === "connected"
                    ? "bg-green-500"
                    : socketStatus === "connecting"
                      ? "bg-yellow-400"
                      : "bg-red-500"
                }`}
              />
              <span>
                {socketStatus === "connected"
                  ? "Live"
                  : socketStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </span>
            <span className="hidden sm:inline text-sm text-gray-500 ml-2">
              {user.email}
            </span>
            <button
              onClick={handleChangePassword}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 cursor-pointer px-2 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0"
              title="Change password"
            >
              <KeyRound size={16} />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 sm:py-2 rounded-lg hover:bg-green-100 cursor-pointer min-h-[44px] sm:min-h-0"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 cursor-pointer px-2 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search name, email, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className={`${filterClass} flex-1 sm:flex-none`}
            >
              <option value="">All Payments</option>
              <option value="yes">Paid</option>
              <option value="no">Not Paid</option>
            </select>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className={`${filterClass} flex-1 sm:flex-none`}
            >
              <option value="">All Attendance</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkDeleting(true)}
                className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors cursor-pointer min-h-[48px]"
              >
                Delete ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-colors cursor-pointer min-h-[48px]"
            >
              <Plus size={16} />
              Add Participant
            </button>
          </div>
        </div>

        {/* Live attendance counter */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-700">
                {presentCount}
              </span>
              <span className="text-sm text-gray-500">
                / {totalParticipants} Present
              </span>
            </div>
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{
                  width:
                    totalParticipants > 0
                      ? `${(presentCount / totalParticipants) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {loading
            ? ""
            : total === 0
              ? "0 participants"
              : `Showing ${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} of ${total} participant${total === 1 ? "" : "s"}`}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-3 w-[4%]">
                  <input
                    type="checkbox"
                    checked={
                      participants.length > 0 &&
                      selectedIds.size === participants.length
                    }
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 w-[36%]">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 w-[20%]">
                  Payment
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 w-[20%]">
                  Attendance
                </th>
                <th className="px-4 py-3 font-medium text-gray-600 w-[20%] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                </>
              ) : participants.length === 0 ? (
                <EmptyState onAdd={() => setModalOpen(true)} />
              ) : (
                participants.map((p) => (
                  <tr
                    key={p._id}
                    className={`border-b last:border-0 hover:bg-gray-50 ${flashedId === p._id ? "animate-flash-green" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.paymentStatus === "yes"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.paymentStatus === "yes" ? "Paid" : "Not Paid"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAttendanceToggle(p)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer border ${
                          p.attendanceStatus === "Present"
                            ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {p.attendanceStatus === "Present"
                          ? "Present"
                          : "Absent"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border p-4 animate-pulse space-y-2"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
              </div>
            ))
          ) : participants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gray-100 rounded-full p-3">
                  <Search size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No participants found</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-sm text-green-700 underline hover:text-green-800 cursor-pointer"
                >
                  Add the first participant
                </button>
              </div>
            </div>
          ) : (
            participants.map((p) => (
              <div
                key={p._id}
                className={`bg-white rounded-xl shadow-sm border p-4 space-y-3 ${flashedId === p._id ? "animate-flash-green" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.email}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p._id)}
                    onChange={() => toggleSelect(p._id)}
                    className="cursor-pointer ml-3 mt-1 shrink-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.paymentStatus === "yes"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.paymentStatus === "yes" ? "Paid" : "Not Paid"}
                  </span>
                  <button
                    onClick={() => handleAttendanceToggle(p)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer border ${
                      p.attendanceStatus === "Present"
                        ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {p.attendanceStatus === "Present" ? "Present" : "Absent"}
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleting(p)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default cursor-pointer"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-gray-400 text-sm">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer ${
                      p === page
                        ? "bg-green-700 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <ParticipantModal
        open={modalOpen || !!editing}
        participant={editing}
        onSave={editing ? handleEdit : handleAdd}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete Participant"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <ConfirmDialog
        open={bulkDeleting}
        title="Delete Participants"
        message={`Are you sure you want to delete ${selectedIds.size} participant${selectedIds.size === 1 ? "" : "s"}? This cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleting(false)}
      />
    </div>
  );
}
