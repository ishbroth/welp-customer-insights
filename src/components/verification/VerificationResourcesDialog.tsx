import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

interface VerificationResourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerificationResourcesDialog = ({ open, onOpenChange }: VerificationResourcesDialogProps) => {
  const resources = [
    {
      state: "California",
      agencies: [
        {
          name: "Department of Consumer Affairs",
          licenseTypes: "Professional licenses (contractors, cosmetology, etc.)",
          url: "https://search.dca.ca.gov/"
        }
      ]
    },
    {
      state: "Texas",
      agencies: [
        {
          name: "Texas Real Estate Commission",
          licenseTypes: "Real estate licenses",
          url: "https://www.trec.texas.gov/apps/license-holder-search/"
        },
        {
          name: "Texas Alcoholic Beverage Commission",
          licenseTypes: "Liquor, bar, and restaurant licenses",
          url: "https://www.tabc.texas.gov/licensing/license-lookup/"
        },
        {
          name: "Texas Department of Licensing and Regulation",
          licenseTypes: "General professional licenses",
          url: "https://vo.ras.texas.gov/datamart/selSearchType.do"
        }
      ]
    },
    {
      state: "Florida",
      agencies: [
        {
          name: "Department of Business and Professional Regulation",
          licenseTypes: "Professional and business licenses",
          url: "https://www.myfloridalicense.com/CheckLicenseII/LicenseDetail.asp"
        }
      ]
    },
    {
      state: "New York",
      agencies: [
        {
          name: "State Liquor Authority",
          licenseTypes: "Liquor, bar, and restaurant licenses",
          url: "https://www.sla.ny.gov/online-services-bureau-licensing"
        },
        {
          name: "Department of Health",
          licenseTypes: "Medical and healthcare licenses",
          url: "https://www.health.ny.gov/professionals/doctors/conduct/lookup.htm"
        }
      ]
    },
    {
      state: "Illinois",
      agencies: [
        {
          name: "Department of Financial and Professional Regulation",
          licenseTypes: "Professional and business licenses",
          url: "https://www.idfpr.com/LicenseLookup/LicenseLookup.asp"
        }
      ]
    },
    {
      state: "Pennsylvania",
      agencies: [
        {
          name: "Department of State - Professional Licensing",
          licenseTypes: "Professional licenses",
          url: "https://www.licensepa.state.pa.us/CheckLicense.aspx"
        }
      ]
    },
    {
      state: "Ohio",
      agencies: [
        {
          name: "Department of Commerce - Professional Licensing",
          licenseTypes: "Professional and trade licenses",
          url: "https://elicense.ohio.gov/Lookup/LicenseLookup.aspx"
        }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Automatic Verification Resources</DialogTitle>
          <DialogDescription>
            Welp automatically verifies business licenses by cross-referencing with the following state databases:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {resources.map((stateResource) => (
            <div key={stateResource.state} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold text-lg mb-3">{stateResource.state}</h3>

              <div className="space-y-3">
                {stateResource.agencies.map((agency, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{agency.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{agency.licenseTypes}</p>
                      </div>
                      <a
                        href={agency.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-welp-primary hover:text-welp-primary-dark flex items-center gap-1 text-xs whitespace-nowrap"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> If automatic verification is not available for your state or license type,
              you can still verify your business through our manual verification process during signup.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationResourcesDialog;
