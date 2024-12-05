import React from 'react';

const Table = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  );
};

Table.Header = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
Table.Body = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
Table.Row = ({ children }) => <tr>{children}</tr>;
Table.Head = ({ children }) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
Table.Cell = ({ children }) => <td className="px-6 py-4 whitespace-nowrap">{children}</td>;

export default Table;

