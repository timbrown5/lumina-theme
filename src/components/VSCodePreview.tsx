/**
 * VSCode-style theme preview component showing realistic coding environment.
 *
 * Provides a comprehensive preview that mimics Visual Studio Code's interface,
 * including file explorer, tabs, syntax highlighting, and data tables.
 * This helps users evaluate themes in a familiar development context.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.colors - Base24 color scheme object
 * @returns {React.ReactElement} VSCode interface preview
 */

import React from 'react';
import type { Base24Colors } from '../types/index.js';

interface SidebarItem {
  icon: string;
  name: string;
  indent: number;
  expanded?: boolean;
  active?: boolean;
  items?: SidebarItem[];
}

const VSCodePreview: React.FC<{ colors: Base24Colors }> = ({ colors }) => {
  const sidebarItems = [
    { icon: '📁', name: 'EXPLORER', expanded: true, indent: 0 },
    { icon: '📁', name: 'configs', indent: 1, expanded: true, items: [
      { icon: '📄', name: 'model_config.yaml', indent: 2 }
    ]},
    { icon: '📁', name: 'data', expanded: true, indent: 1, items: [
      { icon: '📁', name: 'processed', expanded: true, indent: 2, items: [
        { icon: '📄', name: 'cleaned_house_data_v1.csv', indent: 3, active: true },
        { icon: '📄', name: 'cleaned_house_data.csv', indent: 3 },
        { icon: '📄', name: 'data_scientist_features.csv', indent: 3 },
        { icon: '📄', name: 'featured_house_data.csv', indent: 3 }
      ]},
      { icon: '📁', name: 'raw', indent: 2, items: [
        { icon: '📄', name: 'house_data.csv', indent: 3 }
      ]}
    ]},
    { icon: '📁', name: 'models', indent: 1, items: [
      { icon: '📁', name: 'trained', indent: 2 }
    ]}
  ];

/**
 * Renders a sidebar item with proper styling and indentation
 * @param {Object} item - Sidebar item data
 * @param {number} key - React key for the item
 * @returns {React.ReactElement} Rendered sidebar item
 */
  const renderSidebarItem = (item: SidebarItem, key: number) => (
    <div 
      key={key}
      style={{ 
        color: item.active ? colors.base05 : colors.base04,
        backgroundColor: item.active ? colors.base02 : 'transparent',
        paddingLeft: `${item.indent * 12 + 8}px`
      }}
      className="px-2 py-0.5 text-xs hover:bg-opacity-50 cursor-pointer"
    >
      {item.icon && <span className="mr-1">{item.icon}</span>}
      {item.name}
    </div>
  );

  /**
   * Flattens hierarchical sidebar items into a flat array for rendering
   * @param {Array} items - Array of sidebar items
   * @returns {Array} Flattened array of items
   */
  const flattenItems = (items: SidebarItem[]): SidebarItem[] => {
    const result: SidebarItem[] = [];
    items.forEach((item) => {
      result.push(item);
      if (item.items && item.expanded) {
        result.push(...flattenItems(item.items));
      }
    });
    return result;
  };

  return (
    <div 
      className="font-mono text-sm rounded-lg overflow-hidden shadow-lg"
      style={{ backgroundColor: colors.base00, color: colors.base05 }}
    >
      {/* VS Code Title Bar */}
      <div 
        style={{ backgroundColor: colors.base01, borderColor: colors.base02 }}
        className="flex items-center px-4 py-2 border-b"
      >
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span style={{ color: colors.base04 }} className="text-xs ml-4">
            Feature Engineering Notebook for DevOps Learners
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex" style={{ height: '500px' }}>
        {/* Sidebar */}
        <div 
          style={{ backgroundColor: colors.base01, borderColor: colors.base02 }}
          className="w-64 border-r overflow-y-auto"
        >
          <div className="p-2">
            {flattenItems(sidebarItems).map((item, index) => 
              renderSidebarItem(item, index)
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div 
            style={{ backgroundColor: colors.base01, borderColor: colors.base02 }}
            className="border-b px-4 py-2"
          >
            <div className="flex space-x-4">
              <div 
                style={{ 
                  backgroundColor: colors.base00,
                  color: colors.base05,
                  borderColor: colors.base0D
                }}
                className="px-3 py-1 text-xs border-b-2"
              >
                02_feature_engineering.ipynb
              </div>
              <div style={{ color: colors.base04 }} className="px-3 py-1 text-xs">
                01_exploratory_data_analysis.ipynb
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-1">
              {/* Module docstring */}
              <div className="mb-4">
                <span style={{ color: colors.base03 }}># ## </span>
                <span style={{ color: colors.base0E, fontWeight: 'bold' }}>Feature Engi</span>
                <span style={{ color: colors.base05 }}>neering</span>
              </div>
              
              <div className="mb-4" style={{ color: colors.base03 }}>
                <div>matplotlib.pyplot is a state-based interface to matplotlib. It provides an implicit, MATLAB-like, way of plotting. It also opens figures on your screen, and</div>
                <div>acts as the figure GUI manager.</div>
              </div>

              {/* Imports section */}
              <div style={{ color: colors.base03 }}># ---</div>
              <div style={{ color: colors.base03 }}># ## Imports</div>
              
              <div className="space-y-1 mt-2">
                <div>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>import </span>
                  <span style={{ color: colors.base0D }}>pandas </span>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>as </span>
                  <span style={{ color: colors.base0D }}>pd</span>
                </div>
                
                <div>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>import </span>
                  <span style={{ color: colors.base0D }}>numpy </span>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>as </span>
                  <span style={{ color: colors.base0D }}>np</span>
                </div>
                
                <div>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>from </span>
                  <span style={{ color: colors.base0D }}>datetime </span>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>import </span>
                  <span style={{ color: colors.base0D }}>matplotlib.pyplot </span>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>as </span>
                  <span style={{ color: colors.base0D }}>plt</span>
                </div>
                
                <div>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>import </span>
                  <span style={{ color: colors.base0D }}>seaborn </span>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>as </span>
                  <span style={{ color: colors.base0D }}>sns</span>
                </div>
                
                <div>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>import </span>
                  <span style={{ color: colors.base0D }}>matplotlib.</span>
                  <span style={{ color: colors.base0A }}>pyplot </span>
                  <span style={{ color: colors.base0E, fontWeight: 'bold' }}>as </span>
                  <span style={{ color: colors.base0D }}>plt</span>
                </div>
              </div>

              {/* Data loading section */}
              <div className="mt-6">
                <div style={{ color: colors.base03 }}># ---</div>
                <div style={{ color: colors.base03 }}># 🔄 Load Cleaned Data</div>
                
                <div className="mt-2">
                  <span style={{ color: colors.base08 }}>df </span>
                  <span style={{ color: colors.base05 }}>= </span>
                  <span style={{ color: colors.base0D }}>pd.read_csv</span>
                  <span style={{ color: colors.base05 }}>(</span>
                  <span style={{ color: colors.base0B }}>"../data/processed/cleaned_house_data_v1.csv"</span>
                  <span style={{ color: colors.base05 }}>)</span>
                </div>
                
                <div className="mt-1">
                  <span style={{ color: colors.base08 }}>df.</span>
                  <span style={{ color: colors.base0D }}>head</span>
                  <span style={{ color: colors.base05 }}>()</span>
                </div>
              </div>

              {/* Data preview table */}
              <div className="mt-6">
                <div 
                  style={{ 
                    backgroundColor: colors.base01,
                    border: `1px solid ${colors.base02}`,
                    color: colors.base05
                  }}
                  className="rounded p-3"
                >
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ color: colors.base04 }}>
                        <th className="text-left p-1"></th>
                        <th className="text-left p-1">price</th>
                        <th className="text-left p-1">sqft</th>
                        <th className="text-left p-1">bedrooms</th>
                        <th className="text-left p-1">bathrooms</th>
                        <th className="text-left p-1">location</th>
                        <th className="text-left p-1">year_built</th>
                        <th className="text-left p-1">condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['0', '495000', '1527', '2', '1.5', 'Suburb', '1956', 'Good'],
                        ['1', '752000', '2526', '3', '2.5', 'Downtown', '1998', 'Excellent'],
                        ['2', '319000', '1622', '2', '1.5', 'Rural', '1975', 'Fair'],
                        ['3', '1210000', '3102', '4', '3.0', 'Waterfront', '2005', 'Excellent'],
                        ['4', '462000', '1835', '2', '2.0', 'Urban', '1982', 'Good']
                      ].map((row, i) => (
                        <tr key={i}>
                          <td style={{ color: colors.base04 }} className="p-1">{row[0]}</td>
                          <td style={{ color: colors.base09 }} className="p-1">{row[1]}</td>
                          <td style={{ color: colors.base09 }} className="p-1">{row[2]}</td>
                          <td style={{ color: colors.base09 }} className="p-1">{row[3]}</td>
                          <td style={{ color: colors.base09 }} className="p-1">{row[4]}</td>
                          <td style={{ color: colors.base0B }} className="p-1">{row[5]}</td>
                          <td style={{ color: colors.base09 }} className="p-1">{row[6]}</td>
                          <td style={{ color: colors.base0B }} className="p-1">{row[7]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div 
            style={{ 
              backgroundColor: colors.base01,
              borderColor: colors.base02,
              color: colors.base04
            }}
            className="px-4 py-1 text-xs border-t flex justify-between"
          >
            <div className="flex space-x-4">
              <span>Problems 0</span>
              <span>Output</span>
              <span>Debug Console</span>
              <span style={{ color: colors.base05 }}>Terminal</span>
              <span>Ports</span>
              <span>Spell Checker 0</span>
            </div>
            <div style={{ color: colors.base04 }}>
              Python 3.9.7 | Jupyter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VSCodePreview;
