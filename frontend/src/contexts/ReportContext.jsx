import { createContext, useCallback, useContext, useState } from "react";

const ReportContext = createContext();

// Some demo reasons for reporting
const REASONS = [
    // product
    'Suspicion of scamming',
    'Fake products are being sold',
    'The product doesn\'t have an identifiable source',
    'The product is illegal or unsafe',
    // message
    'Spam or Harassment',
    'Hate Speech or Discrimination'
]

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useCart must be used within a ReportProvider');
  }
  return context;
};

export const ReportProvider = ({children}) => {
    const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
    const [reportedItemData, setReportedItemData] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');

    const openReportPopup = useCallback((itemData) => {
        if (!itemData || !['product', 'message'].includes(itemData.type) || itemData.id) {
            console.error("Invalid report data: itemType and id are required.", itemData);
            return;
        }

        setReportedItemData(itemData);
        setReportReason('');
        setReportDetails('');
        setIsReportPopupOpen(true);
    }, [])

    const closeReportPopup = useCallback(() => {
        setIsReportPopupOpen(false);
        setReportedItemData(null);
        setReportReason('');
        setReportDetails('');
    }, [])

    const createReportPayload = useCallback(() => {
        const basePayload = {
            
        }
    })

    const submitReport = (e) => {
        if (!reportReason || !reportDetails.trim()) {
            alert("Please select a reason and provide details");
            return;
        }

        let reportPayload = {};

        if (reportedItemData.type === 'product') {
            reportPayload = {
                reporterUserId: 1, // Placeholder, replace with id of user doing the report
                type: 'product',

            }
        }
    }
}