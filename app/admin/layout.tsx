export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans antialiased text-[#f5f5f5]">
            {children}
        </div>
    )
}
