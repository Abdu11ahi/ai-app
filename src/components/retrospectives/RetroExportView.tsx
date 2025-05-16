"use client";

import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RetroExportData } from "@/lib/export-utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface RetroExportViewProps {
  data: RetroExportData;
}

export const RetroExportView = forwardRef<HTMLDivElement, RetroExportViewProps>(
  ({ data }, ref) => {
    const sprintTitle = data.sprintName || `Sprint ${data.sprintNumber}`;
    
    return (
      <div 
        className="p-8 bg-white text-black max-w-4xl mx-auto print-container" 
        ref={ref}
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#333',
          width: '210mm', // A4 width
          minHeight: '297mm', // A4 height
          margin: '0 auto',
        }}
      >
        <div 
          className="mb-8 space-y-2"
          style={{
            marginBottom: '24px',
          }}
        >
          <h1 
            className="text-3xl font-bold"
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#111',
            }}
          >
            {sprintTitle} Retrospective
          </h1>
          <div 
            className="flex flex-col gap-1"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <p 
              className="text-lg"
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              Team: {data.teamName}
            </p>
            <p 
              className="text-sm text-gray-500"
              style={{
                fontSize: '14px',
                color: '#666',
              }}
            >
              Date: {new Date(data.createdAt).toLocaleDateString()}
            </p>
            <p 
              className="text-sm text-gray-500"
              style={{
                fontSize: '14px',
                color: '#666',
              }}
            >
              Exported: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div 
          className="grid grid-cols-1 gap-6 mb-6"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          {/* What went well */}
          <div 
            className="border border-green-200 overflow-hidden rounded-lg"
            style={{
              border: '1px solid #d1fae5',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div 
              className="bg-green-50 pb-3 px-4 py-3"
              style={{
                backgroundColor: '#ecfdf5', 
                padding: '12px 16px',
                borderBottom: '1px solid #d1fae5',
              }}
            >
              <h2 
                className="text-green-800 flex items-center gap-2 text-xl font-bold"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#166534',
                }}
              >
                <span>✅ What Went Well</span>
              </h2>
            </div>
            <div 
              className="pt-4 px-4 py-4"
              style={{
                padding: '16px',
              }}
            >
              {data.feedback.well.length === 0 ? (
                <p 
                  className="text-gray-500 italic"
                  style={{
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  No feedback provided
                </p>
              ) : (
                <ul 
                  className="space-y-2"
                  style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {data.feedback.well.map((item, i) => (
                    <li 
                      key={i} 
                      className="pb-2 border-b border-gray-100 last:border-0"
                      style={{
                        paddingBottom: '8px',
                        marginBottom: '8px',
                        borderBottom: i < data.feedback.well.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flexGrow: 1 }}>
                          <p>{item.message}</p>
                          {!item.anonymous && item.user_email && (
                            <p 
                              className="text-xs text-gray-500 mt-1"
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px',
                              }}
                            >
                              From: {item.user_email}
                            </p>
                          )}
                        </div>
                        {(item.reactions && (item.reactions?.thumbsup || 0) > 0 || item.reactions && (item.reactions?.thumbsdown || 0) > 0) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            {item.reactions && (item.reactions.thumbsup || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👍</span>
                                <span>{item.reactions.thumbsup}</span>
                              </div>
                            )}
                            {item.reactions && (item.reactions.thumbsdown || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👎</span>
                                <span>{item.reactions.thumbsdown}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* What didn't go well */}
          <div 
            className="border border-red-200 overflow-hidden rounded-lg"
            style={{
              border: '1px solid #fecaca',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div 
              className="bg-red-50 pb-3 px-4 py-3"
              style={{
                backgroundColor: '#fef2f2', 
                padding: '12px 16px',
                borderBottom: '1px solid #fecaca',
              }}
            >
              <h2 
                className="text-red-800 flex items-center gap-2 text-xl font-bold"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#991b1b',
                }}
              >
                <span>❌ What Didn't Go Well</span>
              </h2>
            </div>
            <div 
              className="pt-4 px-4 py-4"
              style={{
                padding: '16px',
              }}
            >
              {data.feedback.didnt.length === 0 ? (
                <p 
                  className="text-gray-500 italic"
                  style={{
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  No feedback provided
                </p>
              ) : (
                <ul 
                  className="space-y-2"
                  style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {data.feedback.didnt.map((item, i) => (
                    <li 
                      key={i} 
                      className="pb-2 border-b border-gray-100 last:border-0"
                      style={{
                        paddingBottom: '8px',
                        marginBottom: '8px',
                        borderBottom: i < data.feedback.didnt.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flexGrow: 1 }}>
                          <p>{item.message}</p>
                          {!item.anonymous && item.user_email && (
                            <p 
                              className="text-xs text-gray-500 mt-1"
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px',
                              }}
                            >
                              From: {item.user_email}
                            </p>
                          )}
                        </div>
                        {(item.reactions && (item.reactions?.thumbsup || 0) > 0 || item.reactions && (item.reactions?.thumbsdown || 0) > 0) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            {item.reactions && (item.reactions.thumbsup || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👍</span>
                                <span>{item.reactions.thumbsup}</span>
                              </div>
                            )}
                            {item.reactions && (item.reactions.thumbsdown || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👎</span>
                                <span>{item.reactions.thumbsdown}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        
          {/* Blockers */}
          <div 
            className="border border-amber-200 overflow-hidden rounded-lg"
            style={{
              border: '1px solid #fde68a',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div 
              className="bg-amber-50 pb-3 px-4 py-3"
              style={{
                backgroundColor: '#fffbeb', 
                padding: '12px 16px',
                borderBottom: '1px solid #fde68a',
              }}
            >
              <h2 
                className="text-amber-800 flex items-center gap-2 text-xl font-bold"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#92400e',
                }}
              >
                <span>⚠️ Blockers</span>
              </h2>
            </div>
            <div 
              className="pt-4 px-4 py-4"
              style={{
                padding: '16px',
              }}
            >
              {data.feedback.blocker.length === 0 ? (
                <p 
                  className="text-gray-500 italic"
                  style={{
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  No blockers reported
                </p>
              ) : (
                <ul 
                  className="space-y-2"
                  style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {data.feedback.blocker.map((item, i) => (
                    <li 
                      key={i} 
                      className="pb-2 border-b border-gray-100 last:border-0"
                      style={{
                        paddingBottom: '8px',
                        marginBottom: '8px',
                        borderBottom: i < data.feedback.blocker.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flexGrow: 1 }}>
                          <p>{item.message}</p>
                          {!item.anonymous && item.user_email && (
                            <p 
                              className="text-xs text-gray-500 mt-1"
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px',
                              }}
                            >
                              From: {item.user_email}
                            </p>
                          )}
                        </div>
                        {(item.reactions && (item.reactions?.thumbsup || 0) > 0 || item.reactions && (item.reactions?.thumbsdown || 0) > 0) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            {item.reactions && (item.reactions.thumbsup || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👍</span>
                                <span>{item.reactions.thumbsup}</span>
                              </div>
                            )}
                            {item.reactions && (item.reactions.thumbsdown || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👎</span>
                                <span>{item.reactions.thumbsdown}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div 
            className="border border-blue-200 overflow-hidden rounded-lg"
            style={{
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div 
              className="bg-blue-50 pb-3 px-4 py-3"
              style={{
                backgroundColor: '#eff6ff', 
                padding: '12px 16px',
                borderBottom: '1px solid #bfdbfe',
              }}
            >
              <h2 
                className="text-blue-800 flex items-center gap-2 text-xl font-bold"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1e40af',
                }}
              >
                <span>💡 Suggestions</span>
              </h2>
            </div>
            <div 
              className="pt-4 px-4 py-4"
              style={{
                padding: '16px',
              }}
            >
              {data.feedback.suggestion.length === 0 ? (
                <p 
                  className="text-gray-500 italic"
                  style={{
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  No suggestions provided
                </p>
              ) : (
                <ul 
                  className="space-y-2"
                  style={{
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {data.feedback.suggestion.map((item, i) => (
                    <li 
                      key={i} 
                      className="pb-2 border-b border-gray-100 last:border-0"
                      style={{
                        paddingBottom: '8px',
                        marginBottom: '8px',
                        borderBottom: i < data.feedback.suggestion.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flexGrow: 1 }}>
                          <p>{item.message}</p>
                          {!item.anonymous && item.user_email && (
                            <p 
                              className="text-xs text-gray-500 mt-1"
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px',
                              }}
                            >
                              From: {item.user_email}
                            </p>
                          )}
                        </div>
                        {(item.reactions && (item.reactions?.thumbsup || 0) > 0 || item.reactions && (item.reactions?.thumbsdown || 0) > 0) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            {item.reactions && (item.reactions.thumbsup || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👍</span>
                                <span>{item.reactions.thumbsup}</span>
                              </div>
                            )}
                            {item.reactions && (item.reactions.thumbsdown || 0) > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <span>👎</span>
                                <span>{item.reactions.thumbsdown}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Themes section */}
        {data.themes.length > 0 && (
          <div 
            className="border border-purple-200 overflow-hidden rounded-lg mb-6"
            style={{
              border: '1px solid #e9d5ff',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '24px',
            }}
          >
            <div 
              className="bg-purple-50 pb-3 px-4 py-3"
              style={{
                backgroundColor: '#faf5ff', 
                padding: '12px 16px',
                borderBottom: '1px solid #e9d5ff',
              }}
            >
              <h2 
                className="text-purple-800 flex items-center gap-2 text-xl font-bold"
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#6b21a8',
                }}
              >
                <span>🔍 Identified Themes</span>
              </h2>
            </div>
            <div 
              className="pt-4 px-4 py-4"
              style={{
                padding: '16px',
              }}
            >
              <ul 
                className="space-y-3"
                style={{
                  listStyleType: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {data.themes.map((theme, i) => (
                  <li 
                    key={i} 
                    className="pb-2 border-b border-gray-100 last:border-0"
                    style={{
                      paddingBottom: '8px',
                      marginBottom: '8px',
                      borderBottom: i < data.themes.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    <p 
                      className="font-medium"
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {theme.name}
                    </p>
                    <p 
                      className="text-xs text-gray-500 mt-1"
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      Type: {theme.type}, Items: {theme.feedback_ids.length}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action items section */}
        <div 
          className="border border-indigo-200 overflow-hidden rounded-lg"
          style={{
            border: '1px solid #c7d2fe',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div 
            className="bg-indigo-50 pb-3 px-4 py-3"
            style={{
              backgroundColor: '#eef2ff', 
              padding: '12px 16px',
              borderBottom: '1px solid #c7d2fe',
            }}
          >
            <h2 
              className="text-indigo-800 flex items-center gap-2 text-xl font-bold"
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#3730a3',
              }}
            >
              <span>🎯 Action Items</span>
            </h2>
          </div>
          <div 
            className="pt-4 px-4 py-4"
            style={{
              padding: '16px',
            }}
          >
            <ol 
              className="list-decimal pl-4 space-y-2"
              style={{
                listStyleType: 'decimal',
                paddingLeft: '20px',
                margin: 0,
              }}
            >
              <li 
                className="pb-2"
                style={{
                  paddingBottom: '8px',
                  marginBottom: '8px',
                }}
              >
                <p 
                  className="font-medium"
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  Action item 1
                </p>
                <p 
                  className="text-sm text-gray-500"
                  style={{
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  Assignee: [TBD]
                </p>
              </li>
              <li 
                className="pb-2"
                style={{
                  paddingBottom: '8px',
                  marginBottom: '8px',
                }}
              >
                <p 
                  className="font-medium"
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  Action item 2
                </p>
                <p 
                  className="text-sm text-gray-500"
                  style={{
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  Assignee: [TBD]
                </p>
              </li>
              <li 
                className="pb-2"
                style={{
                  paddingBottom: '8px',
                  marginBottom: '8px',
                }}
              >
                <p 
                  className="font-medium"
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  Action item 3
                </p>
                <p 
                  className="text-sm text-gray-500"
                  style={{
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  Assignee: [TBD]
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
); 