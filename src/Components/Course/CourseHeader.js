import React from 'react';
import CertificateGenerator from '../Certificate/CertificateGenerator';

const CourseHeader = ({ playlist, playlistId }) => {
  return (
    <div className="bg-slate-100 border-b p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{playlist.title}</h1>
        <div className="ml-auto">
          <CertificateGenerator
            playlistId={playlistId}
            playlist={playlist}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;