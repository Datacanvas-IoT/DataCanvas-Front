import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import TextBox from '../components/input/TextBox';
import Spinner from '../components/Spinner';
import accessTokenService from '../services/accessTokenService';
import AccessTokenCard from '../components/cards/AccessTokenCard';
import InsightCard from '../components/cards/InsightCard';
import SquareCard from '../components/cards/SquareCard';
import RectangularRowCard from '../components/cards/RectangularCard';
import { FaInfoCircle, FaMicrochip, FaGlobe, FaHashtag } from 'react-icons/fa';

const AccessTokenView = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleBack = () => {
    navigate('/accesstoken', { state });
  };

  const handleGetById = async () => {
    const parsed = parseInt(value, 10);
    if (!value || Number.isNaN(parsed)) {
      toast.warning('Please enter a valid Access Key ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await accessTokenService.getAccessKeyById(parsed);
      setResult(response.data);
    } catch (err) {
      switch (err.response?.status) {
        case 400:
          toast.error('Invalid access key ID');
          break;
        case 401:
          toast.error('Your Session Has Expired! Please Login Again!');
          navigate('/login');
          break;
        case 403:
          toast.error('You Are Not Authorized!');
          navigate('/login');
          break;
        case 404:
          toast.error('Access key not found');
          break;
        default:
          toast.error('Failed to fetch access key');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout active={6} breadcrumb={`${localStorage.getItem('project')} > Access Tokens > View`}>
      <div className="px-7 sm:px-10 mt-6 sm:mt-2 flex justify-between">
        <PillButton text="Back" onClick={handleBack} />
      </div>

      <div className="px-7 sm:px-10 mt-4">
        <div className="bg-black3 bg-opacity-50 border border-gray2 border-opacity-30 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-gray1 text-sm">Access Key ID</label>
              <TextBox
                type="number"
                placeholder="Enter Access Key ID"
                textAlign="left"
                width="w-full"
                mt="mt-1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div>
              <PillButton text={loading ? 'Fetching...' : 'Get By ID'} onClick={handleGetById} />
            </div>
          </div>

          {loading && (
            <div className="mt-4"><Spinner isVisible={true} /></div>
          )}

          {result && !loading && (
            <div className="mt-4">
              <div className="border border-gray2 border-opacity-30 rounded-lg p-4">
                {/* Header Card using existing component */}
                <AccessTokenCard
                  token={{ access_key_id: result.access_key_id, access_key_name: result.access_key_name }}
                  showActions={false}
                />

                {/* Renew action when expired */}
                {result.is_expired && (
                  <div className="mt-3 px-1">
                    <div className="bg-black/20 rounded-lg border border-red-500/30 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-red-400 text-sm">This access key is expired.</div>
                      <div className="mt-2 sm:mt-0">
                        <PillButton
                          text="Renew Access Key"
                          onClick={() => toast.info('Renew functionality coming soon')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick insights */}
                <div className="flex flex-col sm:flex-row gap-4 mt-2 px-1">
                  <InsightCard
                    title={result.is_expired ? 'Expired' : 'Active'}
                    subtitle="Status"
                    icon={FaInfoCircle}
                    textSize="sm"
                  />
                  <InsightCard
                    title={`${result.project_id ? 1 : 0}`}
                    subtitle="Projects"
                    icon={FaHashtag}
                    textSize="sm"
                  />
                  <InsightCard
                    title={`${(result.access_key_domain_names || []).length}`}
                    subtitle="Domains"
                    icon={FaGlobe}
                    textSize="sm"
                  />
                </div>

                {/* Detail summary using SquareCard */}
                <div className="flex flex-col sm:flex-row gap-4 mt-3 px-1">
                  <SquareCard
                    title={`${(result.device_ids || []).length}`}
                    subtitle="Devices"
                    onClick={() => {}}
                  />
                  <SquareCard
                    title="Expiration"
                    subtitle={`${result.expiration_date ? new Date(result.expiration_date).toLocaleString() : 'Never'}`}
                    onClick={() => {}}
                  />
                  <SquareCard
                    title="Domains"
                    subtitle={`${(result.access_key_domain_names && result.access_key_domain_names.length > 0) ? result.access_key_domain_names.join(', ') : 'None'}`}
                    onClick={() => {}}
                  />
                </div>

                {(result.description || result.data) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {result.description && (
                      <div className="bg-black/20 rounded p-3 border border-gray2/20">
                        <div className="text-gray1 text-xs">Description</div>
                        <div className="text-gray2 text-sm mt-1 break-words">{result.description}</div>
                      </div>
                    )}
                    {result.data && (
                      <div className="bg-black/20 rounded p-3 border border-gray2/20">
                        <div className="text-gray1 text-xs">Data</div>
                        <pre className="text-gray2 text-xs mt-1 whitespace-pre-wrap break-words">{typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Device IDs using RectangularRowCard */}
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mt-3">
                  <div className="bg-black/20 rounded p-3 border border-gray2/20">
                    <div className="text-gray1 text-xs mb-2">Device IDs</div>
                    <div className="space-y-2">
                      {(result.device_ids || []).length === 0 ? (
                        <div className="text-gray1 text-xs">No devices linked</div>
                      ) : (
                        (result.device_ids || []).map((id) => (
                          <RectangularRowCard
                            key={id}
                            title={`Device ID: ${id}`}
                            subtitle=""
                            icon={FaMicrochip}
                            onClick={() => {}}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </SidebarLayout>
  );
};

export default AccessTokenView;
