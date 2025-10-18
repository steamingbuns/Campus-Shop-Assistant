import { createContext, useCallback, useContext, useState } from "react";

const ReportContext = createContext();

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

export const ReportProvider = ({children}) => {
    const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
    const [reportedItemData, setReportedItemData] = useState(null);
    const [reportDetails, setReportDetails] = useState('');
    const [submittedReports, setSubmittedReports] = useState([]);

    const openReportPopup = useCallback((itemData) => {
        if (!itemData || !['product', 'message'].includes(itemData.type) || itemData.id === undefined) {
            console.error("Invalid report data: itemType and id are required.", itemData);
            return;
        }

        setReportedItemData(itemData);
        setReportDetails('');
        setIsReportPopupOpen(true);
    }, [])

    const closeReportPopup = useCallback(() => {
        setIsReportPopupOpen(false);
        setReportedItemData(null);
        setReportDetails('');
    }, [])

    const createReportPayload = useCallback(() => {
        if (!reportedItemData) return null;

        const basePayload = {
            id: Date.now + Math.floor(Math.random * 1000),
            status: 'open',
            reporterUser: "mock reporter",
            details: reportDetails,
        };

        if (reportedItemData.type === 'product') {
            return {
                ...basePayload,
                type: 'product',
                productID: reportedItemData.id,
            };
        }

        else if (reportedItemData.type === 'message') {
            return {
                ...basePayload,
                type: 'message',
                message: "a", // Placeholder message
                fromUser: "mocker", // Placeholder sender
            };
        }

        return null;
    }, [reportedItemData, reportDetails])

    const submitReport = useCallback((e) => {
        if (e) e.preventDefault();

        if (!reportReason || !reportDetails.trim()) {
            alert("Please select a reason and provide details");
            return;
        }

        const reportPayload = createReportPayload();

        if (reportPayload) {
            console.log("Submitting report: ", reportPayload);
            setSubmittedReports(prevReports => [reportPayload, ...prevReports]);

            closeReportPopup();
        }
        else {
            console.error("Failed to create report payload.");
        }
    }, [reportDetails, createReportPayload, closeReportPopup]);

    const value = useMemo(() => ({
        isReportPopupOpen,
        reportedItemData,
        reportDetails,
        submittedReports,
        openReportPopup,
        closeReportPopup,
        submitReport,
        setReportDetails,
    }), [
        isReportPopupOpen,
        reportedItemData,
        reportDetails,
        submittedReports,
        openReportPopup,
        closeReportPopup,
        submitReport,
    ]);

    return (
        <ReportContext.Provider value={value}>
            {children}
        </ReportContext.Provider>
    )
}