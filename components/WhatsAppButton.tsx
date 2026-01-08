export default function WhatsAppButton({ phone, message }: { phone: string, message: string }) {
  const openWhatsApp = () => {
    // Format: https://wa.me/phonenumber?text=urlencodedtext
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <button 
      onClick={openWhatsApp}
      className="bg-[#25D366] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition"
    >
      Send via WhatsApp
    </button>
  );
}