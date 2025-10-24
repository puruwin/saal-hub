import { useState } from "react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string) => Promise<{ count: number; skipped?: number; errors?: number } | undefined>;
}

const BulkImportModal = ({ isOpen, onClose, onConfirm }: BulkImportModalProps) => {
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  // Verificar si una fecha es lunes
  const isMonday = (dateString: string): boolean => {
    const date = new Date(dateString + 'T00:00:00');
    return date.getDay() === 1;
  };

  // Formatear fecha a dd/mm/yyyy
  const formatDateES = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Obtener nombre del día en español
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      setError('Por favor selecciona una fecha');
      return;
    }
    if (!isMonday(startDate)) {
      setError('La fecha seleccionada debe ser un LUNES. Por favor elige un lunes.');
      return;
    }
    setError('');
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await onConfirm(startDate);
      alert(`✅ Importación completada!\n\n📊 Resumen:\n- Menús creados: ${result?.count || 0}\n- Menús omitidos: ${result?.skipped || 0}\n- Errores: ${result?.errors || 0}\n\nLos menús se han actualizado automáticamente.`);
      handleClose();
    } catch (err: any) {
      const details = err.response?.data?.details || err.message || 'Error desconocido';
      setError(`Error al importar: ${err.response?.data?.error || 'Error'}\n\nDetalles: ${details}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate('');
    setShowConfirmation(false);
    setError('');
    setLoading(false);
    onClose();
  };

  const handleBack = () => {
    setShowConfirmation(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {showConfirmation ? 'Confirmar Importación' : 'Importar Menú Escolar'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!showConfirmation ? (
            <form onSubmit={handleInitialSubmit}>
              <div className="mb-6">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el primer lunes de la escuela
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {startDate && (
                  <div className="mt-2">
                    {isMonday(startDate) ? (
                      <p className="text-sm font-medium text-green-700">
                        ✅ {getDayName(startDate)} - {formatDateES(startDate)} (Correcto)
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-red-700">
                        ❌ {getDayName(startDate)} - {formatDateES(startDate)} (Debe ser lunes)
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  ⚠️ Importante: Debes seleccionar un <strong>LUNES</strong>. Los menús se importarán desde este día.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Se importarán <strong>9 semanas</strong> de menús desde el archivo de datos.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Continuar
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Detalles de la importación:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Fecha de inicio: <strong>{getDayName(startDate)} {formatDateES(startDate)}</strong></li>
                    <li>• Semanas a importar: <strong>9 semanas</strong></li>
                    <li>• Menús totales: <strong>Aproximadamente 63 días</strong></li>
                  </ul>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">¿Estás seguro?</h3>
                      <p className="mt-1 text-sm text-red-700">
                        Esta acción creará una gran cantidad de menús en la base de datos. Los menús que ya existan para las fechas correspondientes serán omitidos.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importando...
                    </>
                  ) : (
                    'Confirmar e Importar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;

