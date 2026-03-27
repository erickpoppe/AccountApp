import { x } from '@xstyled/emotion';
import { Box } from '../lib/layout/Box';

export interface TableColumn {
  key: string;
  label: string;
  style?: string;
}

export interface TableCell {
  key: string;
  value: string;
}

export interface TableRow {
  cells: TableCell[];
  classNames?: string;
}

export interface FinancialSheetTemplateProps {
  organizationName: string;
  sheetName?: string;
  sheetDate?: string;
  footerText?: string;
  table: {
    columns: TableColumn[];
    rows: TableRow[];
  };
  customCSS?: string;
}

export function FinancialSheetTemplate({
  organizationName,
  sheetName,
  sheetDate,
  table,
  customCSS,
  footerText,
}: FinancialSheetTemplateProps) {
  return (
    <Box fontSize="14px">
      <Box p="20px">
        <Box textAlign="center" mb="1rem">
          <Box m={0} fontSize="1.4rem">
            {organizationName}
          </Box>
          {sheetName && <Box m={0}>{sheetName}</Box>}
          {sheetDate && <Box mt="0.35rem">{sheetDate}</Box>}
        </Box>

        <x.table
          borderTop="1px solid #000"
          textAlign="left"
          fontSize="inherit"
          w="100%"
          tableLayout="auto"
          borderCollapse="collapse"
        >
          <x.thead>
            <x.tr>
              {table.columns.map((column) => (
                <x.th
                  key={column.key}
                  color="#000"
                  borderBottom="1px solid #000000"
                  p="0.5rem"
                  className={`column--${column.key}`}
                >
                  {column.label}
                </x.th>
              ))}
            </x.tr>
          </x.thead>
          <x.tbody>
            {table.rows.map((row, rowIndex) => (
              <x.tr key={rowIndex} className={Array.isArray(row.classNames) ? row.classNames.join(' ') : row.classNames}>
                {row.cells.map((cell) => (
                  <x.td
                    key={cell.key}
                    pt="0.28rem"
                    pb="0.28rem"
                    pl="0.5rem"
                    pr="0.5rem"
                    color="#252A31"

                    className={`cell--${cell.key}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: cell.value }} />
                  </x.td>
                ))}
              </x.tr>
            ))}
          </x.tbody>
        </x.table>
        {footerText && (
          <Box style={{ color: '#888', fontSize: '11px', textAlign: 'center', marginTop: '18px', paddingTop: '8px' }}>
            {footerText}
          </Box>
        )}
      </Box>
    </Box>
  );
}
