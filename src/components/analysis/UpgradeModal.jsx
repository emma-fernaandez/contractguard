
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';


const proFeatures = [
    "Unlimited analyses",
    "Download improved contracts",
    "Interactive chat about your contracts",
    "Market comparison data",
    "Priority and faster support"
];

const UpgradeModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    
    const handleUpgrade = () => {
        navigate(createPageUrl('Pricing'));
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Upgrade to ContractGuard Pro</DialogTitle>
          <DialogDescription className="text-center">
            Unlock the full potential of intelligent contract analysis and take complete control.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ul className="space-y-3">
                {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleUpgrade} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white">
            View Plans and Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
