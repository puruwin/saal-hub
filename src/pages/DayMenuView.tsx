import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AllergenIcon from "../components/AllergenIcon";
import { menuService } from "../services/menuService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface MealItem {
    id: number;
    name: string;
    allergens: string[];
}

interface Meal {
    id: number;
    type: 'breakfast' | 'lunch' | 'dinner';
    items: MealItem[];
}

interface Menu {
    id: number;
    date: string;
    meals: Meal[];
}

const mealTypeLabels = {
    breakfast: 'Desayuno',
    lunch: 'Comida',
    dinner: 'Cena'
};

export default function DayMenuView() {
    const { date } = useParams<{ date: string }>();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const [dayMenu, setDayMenu] = useState<Menu | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const loadDayMenu = async () => {
        if (!date) return;

        try {
            setIsLoading(true);
            setError(null);

            const menu = await menuService.getMenuByDate(date);
            setDayMenu(menu);
        } catch (err: any) {
            console.error('Error cargando menú del día:', err);
            setError('Error al cargar el menú del día. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDayMenu();
    }, [date]);

    const handleGoBack = () => {
        navigate('/dashboard');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDownloadPDF = async () => {
        if (!menuRef.current || !date) return;

        setIsGeneratingPDF(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(menuRef.current, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#f8fafc',
                logging: false,
                removeContainer: true,
                foreignObjectRendering: false
            });

            const imgData = canvas.toDataURL('image/png', 0.95);
            const pdf = new jsPDF('l', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = (pdfHeight - imgHeight * ratio) / 2;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

            const fileName = `menu-${date}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Inténtalo de nuevo.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                        <p className="text-gray-700 text-2xl font-medium">Cargando menú del día...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-red-200">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-3xl font-bold text-red-800 mb-4">Error de conexión</h2>
                        <p className="text-red-600 text-xl mb-6">{error}</p>
                        <div className="space-x-4">
                            <button
                                onClick={loadDayMenu}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={handleGoBack}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <div className="flex-shrink-0 p-4 h-10vh" style={{ background: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)' }}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <span className="text-xl">←</span>
                        <span className="font-medium">Volver al Dashboard</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        {date && (
                            <h1 className="text-2xl font-bold text-gray-900">
                                Menú del {formatDate(date)}
                            </h1>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto px-8 py-8 w-full">
                {dayMenu ? (
                    <div
                        ref={menuRef}
                        data-pdf-capture="true"
                        style={{
                            height: '80vh',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '32px'
                        }}
                    >
                        {(['breakfast', 'lunch', 'dinner'] as const).map(mealType => {
                            const meal = dayMenu.meals.find(m => m.type === mealType);

                            const mealStyles = {
                                breakfast: {
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                                    borderColor: '#fbbf24'
                                },
                                lunch: {
                                    background: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)',
                                    borderColor: '#10b981'
                                },
                                dinner: {
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)',
                                    borderColor: '#3b82f6'
                                }
                            };

                            const iconStyles = {
                                breakfast: '🌅',
                                lunch: '🍽️',
                                dinner: '🌙'
                            };

                            return (
                                <div
                                    key={mealType}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: '16px',
                                        border: `2px solid ${mealStyles[mealType].borderColor}`,
                                        padding: '32px 24px',
                                        background: mealStyles[mealType].background,
                                        height: '100%',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                    }}
                                >
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            marginBottom: '32px',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            <span style={{ fontSize: '48px', marginRight: '12px' }}>
                                                {iconStyles[mealType]}
                                            </span>
                                        </div>
                                        <h2
                                            style={{
                                                fontSize: '36px',
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                                margin: 0
                                            }}
                                        >
                                            {mealTypeLabels[mealType]}
                                        </h2>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        {meal && meal.items.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                {meal.items.map((item) => (
                                                    <div key={item.id} style={{ textAlign: 'center' }}>
                                                        <div
                                                            style={{
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                                background: 'rgba(255, 255, 255, 0.8)',
                                                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                            }}
                                                        >
                                                            <h3
                                                                style={{
                                                                    fontSize: '24px',
                                                                    fontWeight: '600',
                                                                    color: '#111827',
                                                                    marginBottom: '12px',
                                                                    lineHeight: '1.2',
                                                                    margin: '0 0 12px 0'
                                                                }}
                                                            >
                                                                {item.name}
                                                            </h3>
                                                            {item.allergens.length > 0 && (
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        flexWrap: 'wrap',
                                                                        gap: '8px'
                                                                    }}
                                                                >
                                                                    {item.allergens.map((allergen, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                            title={allergen}
                                                                        >
                                                                            <AllergenIcon allergen={allergen} className="w-8 h-8" />
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', paddingTop: '64px', paddingBottom: '64px' }}>
                                                <div
                                                    style={{
                                                        borderRadius: '12px',
                                                        padding: '32px',
                                                        background: 'rgba(255, 255, 255, 0.6)',
                                                        border: '1px solid rgba(255, 255, 255, 0.5)',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            color: '#4b5563',
                                                            fontSize: '24px',
                                                            fontWeight: '500',
                                                            margin: 0
                                                        }}
                                                    >
                                                        Sin {mealTypeLabels[mealType].toLowerCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div style={{ background: 'rgba(255, 255, 255, 0.8)' }} className="rounded-3xl p-12 shadow-2xl border border-white/50">
                                <div className="text-8xl mb-6">📅</div>
                                <h2 className="text-5xl font-bold text-gray-800 mb-6">
                                    No hay menú disponible
                                </h2>
                                <p className="text-gray-600 text-2xl font-medium mb-6">
                                    {date && formatDate(date)}
                                </p>
                                <button
                                    onClick={handleGoBack}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Volver al Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
