'use client';

import React from 'react';
import Image from 'next/image';

const BlogManagementTable = ({ blogs, onEdit, onDelete, onAddNew }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-12 transition-all">
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
        <div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tighter">Editorial Desk</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and publish content for your audience</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            Export Report
          </button>
          <button 
            onClick={onAddNew}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Insight
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-50">
              <th className="px-10 py-6">Insight Details</th>
              <th className="px-10 py-6">Category</th>
              <th className="px-10 py-6">Published</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-500 flex items-center justify-center">
                      {blog.image ? (
                        <Image
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          src={blog.image}
                          alt={blog.title}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-2xl">article</span>
                      )}
                    </div>
                    <div className="max-w-xs">
                      <span className="font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1 block mb-1">
                        {blog.title}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{blog.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {blog.category}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{blog.date}</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-500 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Published
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 group-hover:duration-300">
                    <button 
                      onClick={() => onEdit(blog)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all"
                      title="Edit Post"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(blog.id)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-error hover:border-error/20 hover:shadow-lg transition-all"
                      title="Delete Post"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 border-t border-slate-50 bg-slate-50/20 text-center">
        <button className="text-xs font-black uppercase tracking-[0.3em] text-primary hover:tracking-[0.4em] transition-all">
          View All Archive
        </button>
      </div>
    </div>
  );
};

export default BlogManagementTable;
